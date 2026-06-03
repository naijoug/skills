import type { SkillsAdapter } from "./SkillsAdapter";

export interface WebAdapterOptions {
  baseUrl?: string;
}

export function createWebAdapter(options: WebAdapterOptions = {}): SkillsAdapter {
  const baseUrl = options.baseUrl ?? "";

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      },
      ...init
    });
    const data = (await response.json()) as T & { error?: string };
    if (!response.ok) {
      throw new Error(data.error ?? response.statusText);
    }
    return data;
  }

  return {
    listLibrary: () => request("/api/library"),
    importRepository: (input) => request("/api/repositories", { method: "POST", body: JSON.stringify(input) }),
    refreshRepositories: () => request("/api/refresh", { method: "POST", body: "{}" }),
    removeRepository: (input) => request("/api/repositories/remove", { method: "POST", body: JSON.stringify(input) }),
    getSkillDetail: (input) => request(`/api/skills/detail?id=${encodeURIComponent(input.skillId)}`),
    listTranslationProviders: () => request("/api/translation/providers"),
    saveTranslationProviderConfig: (input) =>
      request("/api/translation/providers/config", { method: "POST", body: JSON.stringify(input) }),
    translateSkill: (input) => request("/api/translate", { method: "POST", body: JSON.stringify(input) }),
    listInstallTargets: () => request("/api/install/targets"),
    getInstallStatus: (input) => request("/api/install/status", { method: "POST", body: JSON.stringify(input) }),
    installSkills: (input) => request("/api/install", { method: "POST", body: JSON.stringify(input) }),
    uninstallSkills: (input) => request("/api/uninstall", { method: "POST", body: JSON.stringify(input) })
  };
}
