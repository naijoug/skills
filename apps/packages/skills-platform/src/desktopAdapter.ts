import type { SkillsAdapter } from "./SkillsAdapter";

type Invoke = <T>(command: string, args?: Record<string, unknown>) => Promise<T>;

export interface DesktopAdapterOptions {
  invoke: Invoke;
}

export function createDesktopAdapter({ invoke }: DesktopAdapterOptions): SkillsAdapter {
  return {
    listLibrary: () => invoke("list_library"),
    importRepository: (input) => invoke("import_repository", { input: { ...input, source: "desktop-local" } }),
    refreshRepositories: () => invoke("refresh_repositories"),
    removeRepository: (input) => invoke("remove_repository", { input }),
    getSkillDetail: (input) => invoke("get_skill_detail", { input }),
    listTranslationProviders: () => invoke("list_translation_providers"),
    saveTranslationProviderConfig: (input) => invoke("save_translation_provider_config", { input }),
    translateSkill: (input) => invoke("translate_skill", { input }),
    listInstallTargets: () => invoke("list_install_targets"),
    getInstallStatus: (input) => invoke("get_install_status", { input }),
    installSkills: (input) => invoke("install_skills", { input }),
    uninstallSkills: (input) => invoke("uninstall_skills", { input })
  };
}
