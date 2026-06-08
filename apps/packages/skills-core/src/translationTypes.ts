import type { SkillTranslation } from "./types";

export interface TranslationRequest {
  markdown: string;
  targetLanguage: string;
  sourceLanguage?: string;
  providerId?: string;
  sourceMode?: "summary" | "markdown";
}

export interface TranslationProviderDescriptor {
  id: string;
  label: string;
  configured: boolean;
  supportsConfiguration?: boolean;
  configurationHint?: string;
}

export interface TranslationProviderConfigInput {
  providerId: string;
  apiKey?: string;
  model?: string;
  apiBaseUrl?: string;
}

export type { SkillTranslation };
