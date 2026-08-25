import type { SkillDetail } from "@skills-manager/core";

export type CommandPaletteRuntime = "desktop" | "web";

export type CommandPaletteCommandId = "search-skills" | "open-repositories" | "manage-installs" | "open-settings";

export interface CommandPaletteCommand {
  id: CommandPaletteCommandId;
  title: string;
  hint: string;
  disabledReason?: string;
}

export interface CommandPaletteCommandActions {
  clearQuery(): void;
  closeMenus(): void;
  focusSearch(): void;
  openRepositories(): void;
  manageInstalls(): void;
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
      hint: "Focus and select the skill search field."
    },
    {
      id: "open-repositories",
      title: "Open repositories",
      hint: "Show repository import and refresh controls."
    },
    {
      id: "manage-installs",
      title: selectedDetail ? `Manage installs for ${selectedDetail.title || selectedDetail.name}` : "Manage installs for selected skill",
      hint: installCapabilityHint,
      disabledReason: selectedDetail ? undefined : "Select a skill first"
    },
    {
      id: "open-settings",
      title: "Open settings",
      hint: runtime === "desktop" ? "Open Desktop Mode preferences." : "Open Web Mode preferences."
    }
  ];
}

export function executeCommandPaletteCommand(command: CommandPaletteCommand, actions: CommandPaletteCommandActions): boolean {
  if (command.disabledReason) {
    actions.setStatus(command.disabledReason);
    return false;
  }

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

  actions.openSettings();
  return true;
}

export function commandPaletteKeyboardAction(
  event: Pick<KeyboardEvent, "key">,
  commands: CommandPaletteCommand[],
  activeIndex: number
): CommandPaletteKeyboardResult {
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
  if (event.key === "Escape") {
    return { handled: true, clearQuery: true, nextActiveIndex: 0 };
  }

  return { handled: false };
}

function normalizeCommandIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}
