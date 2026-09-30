import { mkdtemp, rm } from "node:fs/promises";
import { request } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSkillsManagerServer, startSkillsManagerServer } from "../src/server";
import { readSkillSources } from "../src/apiManager";

const repoRoot = join(import.meta.dirname, "../../..");
const tempDirs: string[] = [];

afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("skills-manager-api server", () => {
  it("serves health, library, details, and web install boundary over HTTP", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const dataDir = await tempDataDir();
    const server = createSkillsManagerServer({ repoRoot, dataDir });
    const baseUrl = await listen(server);
    try {
      await expect(getJson(`${baseUrl}/health`)).resolves.toEqual({ ok: true });

      const library = await getJson(`${baseUrl}/api/library`);
      const expectedLocalSkillCount = (await readSkillSources(join(repoRoot, "skills"))).length;
      expect(library.groups).toEqual([expect.objectContaining({ id: "local:workspace", skillCount: expectedLocalSkillCount })]);
      expect(library.skills).toHaveLength(expectedLocalSkillCount);

      const detail = await getJson(`${baseUrl}/api/skills/detail?id=${encodeURIComponent(library.skills[0].id)}`);
      expect(detail).toMatchObject({ id: library.skills[0].id, content: expect.any(String) });

      const removeLocalResponse = await fetch(`${baseUrl}/api/repositories/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryId: "local:workspace" })
      });
      expect(removeLocalResponse.status).toBe(400);
      await expect(removeLocalResponse.json()).resolves.toMatchObject({ error: expect.stringContaining("cannot be removed") });

      const providerConfigResponse = await fetch(`${baseUrl}/api/translation/providers/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: "openai", apiKey: "sk-test" })
      });
      expect(providerConfigResponse.status).toBe(400);
      await expect(providerConfigResponse.json()).resolves.toMatchObject({ error: expect.stringContaining("does not accept") });

      const providers = await getJson(`${baseUrl}/api/translation/providers`);
      expect(providers.map((provider: { id: string }) => provider.id)).toEqual(["openai", "openrouter", "codex", "claude-code"]);

      const translateResponse = await fetch(`${baseUrl}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: library.skills[0].id, targetLanguage: "Chinese", providerId: "openai" })
      });
      expect(translateResponse.status).toBe(503);
      await expect(translateResponse.json()).resolves.toMatchObject({ error: expect.stringContaining("not configured") });

      const missingTargetLanguageResponse = await fetch(`${baseUrl}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: library.skills[0].id, targetLanguage: "   ", providerId: "openai" })
      });
      expect(missingTargetLanguageResponse.status).toBe(400);
      await expect(missingTargetLanguageResponse.json()).resolves.toMatchObject({ error: "Missing target language." });

      const unsupportedProviderResponse = await fetch(`${baseUrl}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: library.skills[0].id, targetLanguage: "Chinese", providerId: "missing-provider" })
      });
      expect(unsupportedProviderResponse.status).toBe(400);
      await expect(unsupportedProviderResponse.json()).resolves.toMatchObject({ error: "Translation provider not found: missing-provider" });

      const installResponse = await fetch(`${baseUrl}/api/install`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillIds: [library.skills[0].id], targetIds: ["codex-global"], mode: "copy", conflictPolicy: "fail" })
      });
      expect(installResponse.status).toBe(400);
      await expect(installResponse.json()).resolves.toMatchObject({ error: expect.stringContaining("desktop app") });

      const uninstallResponse = await fetch(`${baseUrl}/api/uninstall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillIds: [library.skills[0].id], targetIds: ["codex-global"] })
      });
      expect(uninstallResponse.status).toBe(400);
      await expect(uninstallResponse.json()).resolves.toMatchObject({ error: expect.stringContaining("desktop app") });
    } finally {
      await close(server);
    }
  });

  it("responds to CORS preflight requests", async () => {
    const server = createSkillsManagerServer({ repoRoot, dataDir: await tempDataDir() });
    const baseUrl = await listen(server);
    try {
      const response = await fetch(`${baseUrl}/api/library`, { method: "OPTIONS", headers: { Origin: "http://127.0.0.1:5173" } });
      expect(response.status).toBe(204);
      expect(response.headers.get("access-control-allow-origin")).toBe("http://127.0.0.1:5173");
    } finally {
      await close(server);
    }
  });

  it("rejects hostile origins and DNS rebinding before invoking the manager", async () => {
    const server = createSkillsManagerServer({ repoRoot, dataDir: await tempDataDir() });
    const baseUrl = await listen(server);
    try {
      for (const origin of ["https://evil.example", "null", "http://127.0.0.1:9999"]) {
        for (const method of ["GET", "OPTIONS", "POST"]) {
          const response = await fetch(`${baseUrl}/api/library`, { method, headers: { Origin: origin } });
          expect(response.status).toBe(403);
          expect(response.headers.get("access-control-allow-origin")).toBeNull();
        }
      }
      const reboundStatus = await new Promise<number | undefined>((resolve, reject) => {
        request(`${baseUrl}/api/library`, { headers: { Host: "evil.example" } }, (response) => {
          response.resume();
          response.on("end", () => resolve(response.statusCode));
        }).on("error", reject).end();
      });
      expect(reboundStatus).toBe(403);
    } finally {
      await close(server);
    }
  });

  it("rejects side effects over GET, form posts and oversized bodies", async () => {
    const server = createSkillsManagerServer({ repoRoot, dataDir: await tempDataDir() });
    const baseUrl = await listen(server);
    try {
      const get = await fetch(`${baseUrl}/api/refresh`);
      expect(get.status).toBe(405);
      expect(get.headers.get("allow")).toBe("POST");
      const form = await fetch(`${baseUrl}/api/refresh`, { method: "POST", body: "{}" });
      expect(form.status).toBe(415);
      const large = await fetch(`${baseUrl}/api/repositories`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "x".repeat(65 * 1024) })
      });
      expect(large.status).toBe(413);
      expect((await fetch(`${baseUrl}/health`)).status).toBe(200);
    } finally {
      await close(server);
    }
  });

  it("refuses public bind addresses and non-local origin configuration", () => {
    vi.stubEnv("SKILLS_MANAGER_API_HOST", "0.0.0.0");
    expect(() => startSkillsManagerServer()).toThrow("local API");
    expect(() => createSkillsManagerServer({ allowedOrigins: ["https://evil.example"] })).toThrow("loopback origins");
  });

  it("returns 400 for invalid JSON and non-object request bodies", async () => {
    const server = createSkillsManagerServer({ repoRoot, dataDir: await tempDataDir() });
    const baseUrl = await listen(server);
    try {
      const invalidJsonResponse = await fetch(`${baseUrl}/api/repositories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{"
      });
      expect(invalidJsonResponse.status).toBe(400);
      await expect(invalidJsonResponse.json()).resolves.toMatchObject({ error: "Invalid JSON body." });

      const arrayBodyResponse = await fetch(`${baseUrl}/api/repositories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "[]"
      });
      expect(arrayBodyResponse.status).toBe(400);
      await expect(arrayBodyResponse.json()).resolves.toMatchObject({ error: "Expected JSON object body." });

      const missingUrlResponse = await fetch(`${baseUrl}/api/repositories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      });
      expect(missingUrlResponse.status).toBe(400);
      await expect(missingUrlResponse.json()).resolves.toMatchObject({ error: "Missing repository URL." });
    } finally {
      await close(server);
    }
  });
});

async function tempDataDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "skills-manager-server-"));
  tempDirs.push(dir);
  return dir;
}

async function listen(server: ReturnType<typeof createSkillsManagerServer>): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

async function close(server: ReturnType<typeof createSkillsManagerServer>): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function getJson(url: string): Promise<any> {
  const response = await fetch(url);
  expect(response.ok).toBe(true);
  return response.json();
}
