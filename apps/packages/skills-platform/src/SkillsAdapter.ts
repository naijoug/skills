import type {
  InstallResult,
  InstallSkillsRequest,
  InstallStatus,
  InstallTarget,
  SkillDetail,
  SkillTranslation,
  SkillsLibrary,
  TranslationProviderConfigInput,
  TranslationProviderDescriptor,
  UninstallSkillsRequest
} from "@skills-manager/core";

export interface ImportRepositoryInput {
  url: string;
  source?: "server-cache" | "github-api" | "desktop-local";
}

export interface SkillDetailInput {
  skillId: string;
}

export interface RemoveRepositoryInput {
  repositoryId: string;
}

export interface TranslateSkillInput {
  skillId: string;
  targetLanguage: string;
  providerId?: string;
}

export interface SkillsAdapter {
  listLibrary(): Promise<SkillsLibrary>;
  importRepository(input: ImportRepositoryInput): Promise<SkillsLibrary>;
  refreshRepositories(): Promise<SkillsLibrary>;
  removeRepository(input: RemoveRepositoryInput): Promise<SkillsLibrary>;
  getSkillDetail(input: SkillDetailInput): Promise<SkillDetail>;
  listTranslationProviders(): Promise<TranslationProviderDescriptor[]>;
  saveTranslationProviderConfig(input: TranslationProviderConfigInput): Promise<TranslationProviderDescriptor[]>;
  translateSkill(input: TranslateSkillInput): Promise<SkillTranslation>;
  listInstallTargets(): Promise<InstallTarget[]>;
  getInstallStatus(input: { skillIds: string[] }): Promise<InstallStatus[]>;
  installSkills(input: InstallSkillsRequest): Promise<InstallResult>;
  uninstallSkills(input: UninstallSkillsRequest): Promise<InstallResult>;
}
