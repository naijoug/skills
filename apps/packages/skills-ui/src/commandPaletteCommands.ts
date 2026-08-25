import type { SkillDetail } from "@skills-manager/core";

export type CommandPaletteRuntime = "desktop" | "web";

export type CommandPaletteCommandId = "search-skills" | "open-repositories" | "manage-installs" | "open-settings";

export interface CommandPaletteCommand {
  id: CommandPaletteCommandId;
  title: string;
  hint: string;
  disabledReason?: string;
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
