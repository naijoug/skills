import { describe, expect, it, vi } from "vitest";
import type { SkillDetail } from "@skills-manager/core";
import { commandPaletteCommands, executeCommandPaletteCommand, type CommandPaletteCommandActions } from "../src/commandPaletteCommands";

describe("command palette command contract", () => {
  it("exposes the minimum command set in stable order", () => {
    const commands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });

    expect(commands.map((command) => command.id)).toEqual(["search-skills", "open-repositories", "manage-installs", "open-settings"]);
    expect(commands.map((command) => command.title)).toEqual([
      "Search skills",
      "Open repositories",
      "Manage installs for Repo Reviewer",
      "Open settings"
    ]);
  });

  it("requires a selected skill before manage installs can execute", () => {
    const commands = commandPaletteCommands({ selectedDetail: null, runtime: "desktop" });
    const manageInstalls = commands.find((command) => command.id === "manage-installs");

    expect(manageInstalls).toMatchObject({
      title: "Manage installs for selected skill",
      disabledReason: "Select a skill first"
    });
  });

  it("uses desktop capability copy when local installs are available", () => {
    const commands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });

    expect(commands.find((command) => command.id === "manage-installs")?.hint).toBe("Open install targets for the selected skill.");
    expect(commands.find((command) => command.id === "open-settings")?.hint).toBe("Open Desktop Mode preferences.");
  });

  it("keeps web mode honest about local install capability", () => {
    const commands = commandPaletteCommands({ selectedDetail: detail, runtime: "web" });

    expect(commands.find((command) => command.id === "manage-installs")?.hint).toBe(
      "Review install options; local installs require Desktop Mode."
    );
    expect(commands.find((command) => command.id === "open-settings")?.hint).toBe("Open Web Mode preferences.");
  });
});

describe("command palette command execution", () => {
  it("executes each enabled command through the narrow action contract", () => {
    const commands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });

    for (const command of commands) {
      const actions = commandActions();

      expect(executeCommandPaletteCommand(command, actions)).toBe(true);

      expect(actions.clearQuery).toHaveBeenCalledTimes(1);
      expect(actions.closeMenus).toHaveBeenCalledTimes(1);
      expect(actions.setStatus).not.toHaveBeenCalled();
      expect(actions[expectedActionByCommandId[command.id]]).toHaveBeenCalledTimes(1);
    }
  });

  it("reports disabled commands without clearing query or closing command rows", () => {
    const command = commandPaletteCommands({ selectedDetail: null, runtime: "web" }).find((item) => item.id === "manage-installs");
    const actions = commandActions();

    expect(command).toBeDefined();
    expect(executeCommandPaletteCommand(command!, actions)).toBe(false);

    expect(actions.setStatus).toHaveBeenCalledWith("Select a skill first");
    expect(actions.clearQuery).not.toHaveBeenCalled();
    expect(actions.closeMenus).not.toHaveBeenCalled();
    expect(actions.manageInstalls).not.toHaveBeenCalled();
  });
});

function commandActions(): CommandPaletteCommandActions {
  return {
    clearQuery: vi.fn(),
    closeMenus: vi.fn(),
    focusSearch: vi.fn(),
    openRepositories: vi.fn(),
    manageInstalls: vi.fn(),
    openSettings: vi.fn(),
    setStatus: vi.fn()
  };
}

const expectedActionByCommandId = {
  "search-skills": "focusSearch",
  "open-repositories": "openRepositories",
  "manage-installs": "manageInstalls",
  "open-settings": "openSettings"
} as const;

const detail: SkillDetail = {
  id: "repo-review",
  name: "repo-review",
  title: "Repo Reviewer",
  description: "Review imported repositories.",
  category: "manual/review",
  relativePath: "manual/review/repo-review/SKILL.md",
  relativeDir: "manual/review/repo-review",
  groupId: "external",
  groupName: "External Repo",
  groupKind: "github",
  content: "# Repo Reviewer\n\n## Workflow\n\n- Inspect the repo\n- Report risk",
  frontmatter: {},
  manifest: {},
  relatedFiles: []
};
