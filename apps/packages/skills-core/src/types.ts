export type GroupKind = "local" | "github" | "gitlab" | "web-cache" | "github-api";

export interface SkillGroup {
  id: string;
  name: string;
  kind: GroupKind;
  url?: string;
  path?: string;
  importedAt?: string;
  updatedAt?: string;
  skillCount?: number;
}

export interface SkillSummary {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  searchText?: string;
  relativePath: string;
  relativeDir: string;
  groupId: string;
  groupName: string;
  groupKind: GroupKind;
}

export interface SkillDetail extends SkillSummary {
  content: string;
  frontmatter: Record<string, string>;
  manifest: Record<string, string>;
  relatedFiles: SkillRelatedFile[];
  absolutePath?: string;
}

export interface SkillFileSource {
  relativePath: string;
  content: string;
  manifestContent?: string;
  relatedFiles?: SkillRelatedFile[];
  absolutePath?: string;
}

export type SkillRelatedFileKind = "markdown" | "reference" | "code" | "config" | "asset" | "other";

export interface SkillRelatedFile {
  relativePath: string;
  kind: SkillRelatedFileKind;
  sizeBytes?: number;
  content?: string;
}

export interface SkillsLibrary {
  groups: SkillGroup[];
  skills: SkillSummary[];
}

export interface SkillTranslation {
  skillId?: string;
  providerId: string;
  targetLanguage: string;
  markdown: string;
  model?: string;
}

export interface AppErrorShape {
  code: string;
  message: string;
  cause?: unknown;
}
