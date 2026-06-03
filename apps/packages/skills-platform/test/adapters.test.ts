import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesktopAdapter, createWebAdapter } from "../src";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("platform adapters", () => {
  it("maps web adapter methods to API routes", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url, init });
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      })
    );

    const adapter = createWebAdapter({ baseUrl: "http://api.test" });
    await adapter.importRepository({ url: "https://github.com/acme/skills", source: "github-api" });
    await adapter.refreshRepositories();
    await adapter.removeRepository({ repositoryId: "github:acme/skills" });
    await adapter.getSkillDetail({ skillId: "local%3Aworkspace::manual%2Ftool%2Fx%2FSKILL.md" });
    await adapter.saveTranslationProviderConfig({ providerId: "openai", apiKey: "sk-test" });
    await adapter.installSkills({ skillIds: ["id"], targetIds: ["target"], mode: "copy", conflictPolicy: "fail" });
    await adapter.uninstallSkills({ skillIds: ["id"], targetIds: ["target"] });

    expect(calls.map((call) => call.url)).toEqual([
      "http://api.test/api/repositories",
      "http://api.test/api/refresh",
      "http://api.test/api/repositories/remove",
      "http://api.test/api/skills/detail?id=local%253Aworkspace%3A%3Amanual%252Ftool%252Fx%252FSKILL.md",
      "http://api.test/api/translation/providers/config",
      "http://api.test/api/install",
      "http://api.test/api/uninstall"
    ]);
    expect(calls[0].init).toMatchObject({ method: "POST" });
    expect(JSON.parse(calls[0].init?.body as string)).toMatchObject({ source: "github-api" });
  });

  it("maps desktop adapter methods to Tauri command names", async () => {
    const calls: Array<{ command: string; args?: Record<string, unknown> }> = [];
    const adapter = createDesktopAdapter({
      invoke: async (command, args) => {
        calls.push({ command, args });
        return {} as never;
      }
    });

    await adapter.listLibrary();
    await adapter.importRepository({ url: "https://github.com/acme/skills", source: "server-cache" });
    await adapter.refreshRepositories();
    await adapter.removeRepository({ repositoryId: "github:acme/skills" });
    await adapter.saveTranslationProviderConfig({ providerId: "openai", apiKey: "sk-test" });
    await adapter.installSkills({ skillIds: ["id"], targetIds: ["codex-global"], mode: "copy", conflictPolicy: "skip" });
    await adapter.uninstallSkills({ skillIds: ["id"], targetIds: ["codex-global"] });

    expect(calls).toEqual([
      { command: "list_library", args: undefined },
      {
        command: "import_repository",
        args: { input: { url: "https://github.com/acme/skills", source: "desktop-local" } }
      },
      { command: "refresh_repositories", args: undefined },
      {
        command: "remove_repository",
        args: { input: { repositoryId: "github:acme/skills" } }
      },
      {
        command: "save_translation_provider_config",
        args: { input: { providerId: "openai", apiKey: "sk-test" } }
      },
      {
        command: "install_skills",
        args: { input: { skillIds: ["id"], targetIds: ["codex-global"], mode: "copy", conflictPolicy: "skip" } }
      },
      {
        command: "uninstall_skills",
        args: { input: { skillIds: ["id"], targetIds: ["codex-global"] } }
      }
    ]);
  });
});
