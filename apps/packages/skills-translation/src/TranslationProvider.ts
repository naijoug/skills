import type { SkillTranslation } from "@skills-manager/core";

export interface TranslateMarkdownInput {
  markdown: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslationProvider {
  id: string;
  label: string;
  supportsConfiguration?: boolean;
  configurationHint?: string;
  configured(): boolean;
  translate(input: TranslateMarkdownInput): Promise<SkillTranslation>;
}
