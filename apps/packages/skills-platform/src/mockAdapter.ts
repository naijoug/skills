import type {
  InstallResult,
  InstallSkillsRequest,
  InstallStatus,
  InstallTarget,
  SkillDetail,
  SkillFileSource,
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
  id: "github:acme/skills",
  name: "core-skills",
  kind: "github",
  url: "https://github.com/acme/skills"
};
const repositoryGroups: SkillGroup[] = [
  group,
  ...Array.from({ length: 11 }, (_, index) => ({
    id: `github:acme/skills-extra-${index + 1}`,
    name: `repo-${index + 1}`,
    kind: "github" as const,
    url: `https://github.com/acme/skills-extra-${index + 1}`
  }))
];

const typeSafetySource = skillSource(
  "skills/code-quality/type-safety/SKILL.md",
  "type-safety",
  "Improve type safety and prevent type-related bugs in your codebase.",
  [
    "---",
    "name: type-safety",
    "description: Improve type safety and prevent type-related bugs in your codebase.",
    "---",
    "",
    "# type-safety",
    "",
    "Improve type safety and prevent type-related bugs in your codebase.",
    "",
    "## Purpose",
    "",
    "Promote strong type safety across the codebase to catch errors early, improve developer experience, and make refactoring safer.",
    "",
    "## When to Use",
    "",
    "- When introducing TypeScript to a JavaScript project",
    "- When adding new features that benefit from static typing",
    "- When refactoring code to reduce runtime type errors",
    "- When integrating with external libraries or APIs",
    "",
    "## Steps",
    "",
    "1. Enable strict type checking in tsconfig.json",
    "2. Add or refine types for public APIs and data structures",
    "3. Use interfaces or types for function inputs and outputs",
    "4. Replace any with specific types",
    "5. Run the type checker and fix remaining issues",
    "6. Add type tests for critical modules",
    "",
    "## References",
    "",
    "- TypeScript Handbook - https://www.typescriptlang.org/docs/handbook/intro.html",
    "- Effective TypeScript - https://effectivetypescript.com/",
    "- TypeScript Deep Dive - https://basarat.gitbook.io/typescript/"
  ],
  [
    {
      relativePath: "skills/code-quality/type-safety/references/checklist.md",
      kind: "reference",
      sizeBytes: 96,
      content: "# Type Safety Checklist\n\n- Run the type checker\n- Replace unsafe any usage\n- Add public API types"
    },
    {
      relativePath: "skills/code-quality/type-safety/scripts/audit-types.ts",
      kind: "code",
      sizeBytes: 91,
      content: "export function auditTypes(paths: string[]): string[] {\n  return paths.filter((path) => path.endsWith('.ts'));\n}"
    }
  ]
);

const featuredSources: SkillFileSource[] = [
  skillSource("skills/ai-agents/agent-loop/SKILL.md", "agent-loop", "Build resilient agent loops"),
  skillSource("skills/ai-agents/context-engineering/SKILL.md", "context-engineering", "Manage and optimize context"),
  skillSource("skills/ai-agents/tool-use-patterns/SKILL.md", "tool-use-patterns", "Patterns for tool calling"),
  skillSource("skills/code-quality/code-review/SKILL.md", "code-review", "Review code changes effectively"),
  skillSource("skills/code-quality/linting-setup/SKILL.md", "linting-setup", "Configure linters and formatters"),
  skillSource("skills/code-quality/refactor-strategy/SKILL.md", "refactor-strategy", "Safe refactoring approaches"),
  typeSafetySource,
  skillSource("skills/development/debugging-techniques/SKILL.md", "debugging-techniques", "Systematic debugging methods"),
  skillSource("skills/development/error-handling/SKILL.md", "error-handling", "Robust error handling patterns"),
  skillSource("skills/development/logging-best-practices/SKILL.md", "logging-best-practices", "Effective logging strategies"),
  skillSource("skills/git-github/conventional-commits/SKILL.md", "conventional-commits", "Use conventional commits")
];

const generatedSources: SkillFileSource[] = [
  ...generatedCategory("ai-agents", 5, "agent-pattern", "Reusable agent workflow pattern"),
  ...generatedCategory("code-quality", 10, "quality-check", "Code quality guardrail"),
  ...generatedCategory("development", 17, "developer-practice", "Developer workflow practice"),
  ...generatedCategory("git-github", 11, "git-workflow", "Git and GitHub workflow"),
  ...generatedCategory("testing", 18, "test-strategy", "Testing strategy playbook"),
  ...generatedCategory("productivity", 16, "productivity-system", "Productivity workflow"),
  ...generatedCategory("documentation", 17, "docs-pattern", "Documentation pattern"),
  ...generatedCategory("deployment", 11, "release-flow", "Release and deployment workflow"),
  ...generatedCategory("security", 12, "security-check", "Security workflow")
];

const mockSources = [...featuredSources, ...generatedSources];
const mockSourcesById = new Map(mockSources.map((source) => [parseSkillFile(group, source).id, source]));

export const mockLibrary: SkillsLibrary = buildLibrary(repositoryGroups, new Map([[group.id, mockSources]]));

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
  async getSkillDetail(input: SkillDetailInput): Promise<SkillDetail> {
    return parseSkillFile(group, mockSourcesById.get(input.skillId) ?? typeSafetySource);
  },
  async listTranslationProviders(): Promise<TranslationProviderDescriptor[]> {
    return [
      { id: "openai", label: "OpenAI", configured: false, supportsConfiguration: true },
      { id: "openrouter", label: "OpenRouter", configured: false, supportsConfiguration: true },
      { id: "codex", label: "Local Codex", configured: true, configurationHint: "Uses local `codex exec` in read-only, ephemeral mode." },
      { id: "claude-code", label: "Local Claude Code", configured: true, configurationHint: "Uses local `claude -p` with no session persistence." }
    ];
  },
  async saveTranslationProviderConfig(input: TranslationProviderConfigInput): Promise<TranslationProviderDescriptor[]> {
    return [
      { id: "openai", label: "OpenAI", configured: input.providerId === "openai", supportsConfiguration: true },
      { id: "openrouter", label: "OpenRouter", configured: input.providerId === "openrouter", supportsConfiguration: true },
      { id: "codex", label: "Local Codex", configured: true, configurationHint: "Uses local `codex exec` in read-only, ephemeral mode." },
      { id: "claude-code", label: "Local Claude Code", configured: true, configurationHint: "Uses local `claude -p` with no session persistence." }
    ];
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

function generatedCategory(category: string, count: number, prefix: string, description: string): SkillFileSource[] {
  return Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return skillSource(`skills/${category}/${prefix}-${number}/SKILL.md`, `${prefix}-${number}`, `${description} ${index + 1}`);
  });
}

function skillSource(
  relativePath: string,
  name: string,
  description: string,
  content?: string[],
  relatedFiles?: SkillFileSource["relatedFiles"]
): SkillFileSource {
  if (content) {
    return { relativePath, content: content.join("\n"), relatedFiles };
  }
  return {
    relativePath,
    content: [
      "---",
      `name: ${name}`,
      `description: ${description}`,
      "---",
      "",
      `# ${name}`,
      "",
      description,
      "",
      "## Overview",
      "",
      `${description} for day-to-day skill workflows.`,
      "",
      "## When to Use",
      "",
      `- When you need ${description.toLowerCase()}`,
      "- When a repeatable checklist keeps the work consistent"
    ].join("\n"),
    relatedFiles
  };
}
