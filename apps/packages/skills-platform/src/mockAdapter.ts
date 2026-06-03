import type {
  InstallResult,
  InstallSkillsRequest,
  InstallStatus,
  InstallTarget,
  SkillDetail,
  SkillGroup,
  SkillsLibrary,
  SkillTranslation,
  TranslationProviderConfigInput,
  TranslationProviderDescriptor,
  UninstallSkillsRequest
} from "@skills-manager/core";
import { buildLibrary, parseSkillFile } from "@skills-manager/core";
import type { ImportRepositoryInput, SkillDetailInput, SkillsAdapter, TranslateSkillInput } from "./SkillsAdapter";

const group: SkillGroup = {
  id: "mock:local",
  name: "Mock skills",
  kind: "local"
};

const mockSource = {
  relativePath: "manual/tool/example/SKILL.md",
  content: [
    "---",
    "name: mock-example",
    "description: Example skill used by the shared UI mock adapter",
    "---",
    "",
    "# Example Skill",
    "",
    "This skill exists so the UI can run before platform adapters are connected."
  ].join("\n")
};

export const mockLibrary: SkillsLibrary = buildLibrary([group], new Map([[group.id, [mockSource]]]));

export const mockAdapter: SkillsAdapter = {
  async listLibrary(): Promise<SkillsLibrary> {
    return mockLibrary;
  },
  async importRepository(_input: ImportRepositoryInput): Promise<SkillsLibrary> {
    return mockLibrary;
  },
  async refreshRepositories(): Promise<SkillsLibrary> {
    return mockLibrary;
  },
  async removeRepository(): Promise<SkillsLibrary> {
    return mockLibrary;
  },
  async getSkillDetail(_input: SkillDetailInput): Promise<SkillDetail> {
    return parseSkillFile(group, mockSource);
  },
  async listTranslationProviders(): Promise<TranslationProviderDescriptor[]> {
    return [{ id: "openai", label: "OpenAI", configured: false, supportsConfiguration: true }];
  },
  async saveTranslationProviderConfig(_input: TranslationProviderConfigInput): Promise<TranslationProviderDescriptor[]> {
    return [{ id: "openai", label: "OpenAI", configured: true, supportsConfiguration: true }];
  },
  async translateSkill(input: TranslateSkillInput): Promise<SkillTranslation> {
    return {
      providerId: input.providerId ?? "mock",
      targetLanguage: input.targetLanguage,
      markdown: "# Mock Translation\n\nConfigure a real provider to translate skill details."
    };
  },
  async listInstallTargets(): Promise<InstallTarget[]> {
    return [
      {
        id: "codex-global",
        toolId: "codex",
        label: "Codex global",
        skillsDir: "~/.codex/skills",
        slashCommandsDir: "~/.codex/prompts",
        exists: false
      },
      {
        id: "codex-project",
        toolId: "codex",
        label: "Codex project",
        skillsDir: "./.codex/skills",
        slashCommandsDir: "./.codex/prompts",
        exists: false
      },
      {
        id: "chatgpt-global",
        toolId: "chatgpt",
        label: "ChatGPT global (Codex alias)",
        skillsDir: "~/.codex/skills",
        slashCommandsDir: "~/.codex/prompts",
        exists: false
      },
      {
        id: "chatgpt-project",
        toolId: "chatgpt",
        label: "ChatGPT project (Codex alias)",
        skillsDir: "./.codex/skills",
        slashCommandsDir: "./.codex/prompts",
        exists: false
      },
      {
        id: "claude-code-global",
        toolId: "claude-code",
        label: "Claude Code global",
        skillsDir: "~/.claude/skills",
        slashCommandsDir: "~/.claude/commands",
        exists: false
      },
      {
        id: "claude-code-project",
        toolId: "claude-code",
        label: "Claude Code project",
        skillsDir: "./.claude/skills",
        slashCommandsDir: "./.claude/commands",
        exists: false
      },
      {
        id: "amp-global",
        toolId: "amp",
        label: "Amp global",
        skillsDir: "~/.agents/skills",
        exists: false
      },
      {
        id: "amp-project",
        toolId: "amp",
        label: "Amp project",
        skillsDir: "./.agents/skills",
        exists: false
      }
    ];
  },
  async getInstallStatus(): Promise<InstallStatus[]> {
    return [];
  },
  async installSkills(_input: InstallSkillsRequest): Promise<InstallResult> {
    return { items: [] };
  },
  async uninstallSkills(_input: UninstallSkillsRequest): Promise<InstallResult> {
    return { items: [] };
  }
};
