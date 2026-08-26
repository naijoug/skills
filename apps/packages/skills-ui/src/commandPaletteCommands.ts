import type { SkillDetail } from "@skills-manager/core";

export type CommandPaletteRuntime = "desktop" | "web";

export type CommandPaletteCommandId =
  | "search-skills"
  | "open-repositories"
  | "manage-installs"
  | "copy-skill-path"
  | "translate-summary"
  | "export-gist-bundle"
  | "open-settings";

export interface CommandPaletteCommand {
  id: CommandPaletteCommandId;
  title: string;
  hint: string;
  keywords: string[];
  disabledReason?: string;
}

export interface CommandPaletteCommandActions {
  clearStatus(): void;
  clearQuery(): void;
  closeMenus(): void;
  focusSearch(): void;
  openRepositories(): void;
  manageInstalls(): void;
  copySkillPath(): void;
  translateSummary(): void;
  exportGistBundle(): void;
  openSettings(): void;
  setStatus(message: string): void;
}

export interface CommandPaletteKeyboardResult {
  handled: boolean;
  nextActiveIndex?: number;
  selectCommandId?: CommandPaletteCommandId;
  clearQuery?: boolean;
}

export interface CommandPaletteCommandContext {
  selectedDetail: SkillDetail | null;
  runtime: CommandPaletteRuntime;
}

export function commandPaletteCommands({ selectedDetail, runtime }: CommandPaletteCommandContext): CommandPaletteCommand[] {
  const installCapabilityHint =
    runtime === "desktop" ? "Open install targets for the selected skill." : "Review install options; local installs require Desktop Mode.";

  return [
    {
      id: "search-skills",
      title: "Search skills",
      hint: "Focus and select the skill search field.",
      keywords: ["search", "find", "skill", "skills", "filter"]
    },
    {
      id: "open-repositories",
      title: "Open repositories",
      hint: "Show repository import and refresh controls.",
      keywords: ["repo", "repos", "repository", "repositories", "import", "refresh", "source", "sources"]
    },
    {
      id: "manage-installs",
      title: selectedDetail ? `Manage installs for ${selectedDetail.title || selectedDetail.name}` : "Manage installs for selected skill",
      hint: installCapabilityHint,
      keywords: ["install", "installs", "target", "targets", "manage", "local", "desktop"],
      disabledReason: selectedDetail ? undefined : "Select a skill first"
    },
    {
      id: "copy-skill-path",
      title: selectedDetail ? `Copy path for ${selectedDetail.title || selectedDetail.name}` : "Copy selected skill path",
      hint: "Copy the selected skill relative path; download a text fallback if clipboard is unavailable.",
      keywords: ["copy", "path", "relative", "link", "location", "clipboard", "download"],
      disabledReason: selectedDetail ? undefined : "Select a skill first"
    },
    {
      id: "translate-summary",
      title: selectedDetail ? `Translate summary for ${selectedDetail.title || selectedDetail.name}` : "Translate selected skill summary",
      hint: "Open the selected skill summary translation panel.",
      keywords: ["translate", "translation", "language", "summary", "localize", "i18n"],
      disabledReason: selectedDetail ? undefined : "Select a skill first"
    },
    {
      id: "export-gist-bundle",
      title: selectedDetail ? `Export Gist bundle for ${selectedDetail.title || selectedDetail.name}` : "Export selected skill Gist bundle",
      hint: "Copy a Gist-ready skill bundle; download a markdown fallback if clipboard is unavailable.",
      keywords: ["export", "gist", "bundle", "share", "markdown", "clipboard", "download"],
      disabledReason: selectedDetail ? undefined : "Select a skill first"
    },
    {
      id: "open-settings",
      title: "Open settings",
      hint: runtime === "desktop" ? "Open Desktop Mode preferences." : "Open Web Mode preferences.",
      keywords: ["settings", "setting", "preferences", "prefs", "options", "appearance"]
    }
  ];
}

export function commandPaletteSearchTerm(query: string): string {
  const trimmed = query.trimStart();
  if (!trimmed.startsWith(">")) {
    return "";
  }
  return normalizeCommandText(trimmed.slice(1));
}

export function filterCommandPaletteCommands(commands: CommandPaletteCommand[], query: string): CommandPaletteCommand[] {
  const searchTerm = commandPaletteSearchTerm(query);
  if (!searchTerm) {
    return commands;
  }

  return commands.filter((command) => commandMatchesSearchTerm(command, searchTerm));
}

export function executeCommandPaletteCommand(command: CommandPaletteCommand, actions: CommandPaletteCommandActions): boolean {
  if (command.disabledReason) {
    actions.setStatus(command.disabledReason);
    return false;
  }

  actions.clearStatus();
  actions.clearQuery();
  actions.closeMenus();

  if (command.id === "search-skills") {
    actions.focusSearch();
    return true;
  }
  if (command.id === "open-repositories") {
    actions.openRepositories();
    return true;
  }
  if (command.id === "manage-installs") {
    actions.manageInstalls();
    return true;
  }
  if (command.id === "copy-skill-path") {
    actions.copySkillPath();
    return true;
  }
  if (command.id === "translate-summary") {
    actions.translateSummary();
    return true;
  }
  if (command.id === "export-gist-bundle") {
    actions.exportGistBundle();
    return true;
  }

  actions.openSettings();
  return true;
}

export function commandPaletteKeyboardAction(
  event: Pick<KeyboardEvent, "key">,
  commands: CommandPaletteCommand[],
  activeIndex: number
): CommandPaletteKeyboardResult {
  if (event.key === "Escape") {
    return { handled: true, clearQuery: true, nextActiveIndex: 0 };
  }

  if (commands.length === 0) {
    return { handled: false };
  }

  if (event.key === "ArrowDown") {
    return { handled: true, nextActiveIndex: normalizeCommandIndex(activeIndex + 1, commands.length) };
  }
  if (event.key === "ArrowUp") {
    return { handled: true, nextActiveIndex: normalizeCommandIndex(activeIndex - 1, commands.length) };
  }
  if (event.key === "Enter") {
    return { handled: true, selectCommandId: commands[normalizeCommandIndex(activeIndex, commands.length)].id };
  }
  return { handled: false };
}

function normalizeCommandIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function commandMatchesSearchTerm(command: CommandPaletteCommand, searchTerm: string): boolean {
  return commandSearchText(command).includes(searchTerm);
}

function commandSearchText(command: CommandPaletteCommand): string {
  // Match only explicit, stable command keywords plus disabled reasons. Dynamic titles may
  // include the selected skill name, and generic hints such as "local installs require Desktop"
  // should not silently become undocumented aliases for unrelated command queries.
  return normalizeCommandText([command.id, command.keywords.join(" "), command.disabledReason ?? ""].join(" "));
}

function normalizeCommandText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
