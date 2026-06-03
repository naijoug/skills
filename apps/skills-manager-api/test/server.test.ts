import { mkdtemp, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSkillsManagerServer } from "../src/server";

const repoRoot = join(import.meta.dirname, "../../..");
const tempDirs: string[] = [];

afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("skills-manager-api server", () => {
  it("serves health, library, details, and web install boundary over HTTP", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const dataDir = await tempDataDir();
    const server = createSkillsManagerServer({ repoRoot, dataDir });
    const baseUrl = await listen(server);
    try {
      await expect(getJson(`${baseUrl}/health`)).resolves.toEqual({ ok: true });

      const library = await getJson(`${baseUrl}/api/library`);
      expect(library.groups).toEqual([expect.objectContaining({ id: "local:workspace", skillCount: 24 })]);
      expect(library.skills).toHaveLength(24);

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
      const response = await fetch(`${baseUrl}/api/library`, { method: "OPTIONS" });
      expect(response.status).toBe(204);
      expect(response.headers.get("access-control-allow-origin")).toBe("*");
    } finally {
      await close(server);
    }
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
      await expect(missingUrlResponse.json()).resolves.toMatchObject({ error: "Missing GitHub repository URL." });
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
