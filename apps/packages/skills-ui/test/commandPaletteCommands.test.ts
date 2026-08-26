import { describe, expect, it, vi } from "vitest";
import type { SkillDetail } from "@skills-manager/core";
import {
  commandPaletteSearchTerm,
  commandPaletteCommands,
  commandPaletteKeyboardAction,
  executeCommandPaletteCommand,
  filterCommandPaletteCommands,
  type CommandPaletteCommandActions
} from "../src/commandPaletteCommands";

describe("command palette command contract", () => {
  it("exposes the minimum command set in stable order", () => {
    const commands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });

    expect(commands.map((command) => command.id)).toEqual([
      "search-skills",
      "open-repositories",
      "manage-installs",
      "copy-skill-path",
      "translate-summary",
      "export-gist-bundle",
      "open-settings"
    ]);
    expect(commands.map((command) => command.title)).toEqual([
      "Search skills",
      "Open repositories",
      "Manage installs for Repo Reviewer",
      "Copy path for Repo Reviewer",
      "Translate summary for Repo Reviewer",
      "Export Gist bundle for Repo Reviewer",
      "Open settings"
    ]);
    expect(commands.map((command) => command.keywords)).toEqual([
      ["search", "find", "skill", "skills", "filter"],
      ["repo", "repos", "repository", "repositories", "import", "refresh", "source", "sources"],
      ["install", "installs", "target", "targets", "manage", "local", "desktop"],
      ["copy", "path", "relative", "link", "location", "clipboard", "download"],
      ["translate", "translation", "language", "summary", "localize", "i18n"],
      ["export", "gist", "bundle", "share", "markdown", "clipboard", "download"],
      ["settings", "setting", "preferences", "prefs", "options", "appearance"]
    ]);
  });

  it("requires a selected skill before selected-detail commands can execute", () => {
    const commands = commandPaletteCommands({ selectedDetail: null, runtime: "desktop" });

    expect(commands.filter((command) => command.disabledReason).map((command) => command.id)).toEqual([
      "manage-installs",
      "copy-skill-path",
      "translate-summary",
      "export-gist-bundle"
    ]);
    expect(commands.find((command) => command.id === "manage-installs")).toMatchObject({
      title: "Manage installs for selected skill",
      disabledReason: "Select a skill first"
    });
    expect(commands.find((command) => command.id === "copy-skill-path")?.title).toBe("Copy selected skill path");
    expect(commands.find((command) => command.id === "translate-summary")?.title).toBe("Translate selected skill summary");
    expect(commands.find((command) => command.id === "export-gist-bundle")?.title).toBe("Export selected skill Gist bundle");
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

      expect(actions.clearStatus).toHaveBeenCalledTimes(1);
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
    expect(actions.clearStatus).not.toHaveBeenCalled();
    expect(actions.clearQuery).not.toHaveBeenCalled();
    expect(actions.closeMenus).not.toHaveBeenCalled();
    expect(actions.manageInstalls).not.toHaveBeenCalled();
  });
});

describe("command palette keyboard contract", () => {
  it("cycles active command rows with arrow keys", () => {
    const commands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });

    expect(commandPaletteKeyboardAction({ key: "ArrowDown" }, commands, 0)).toEqual({ handled: true, nextActiveIndex: 1 });
    expect(commandPaletteKeyboardAction({ key: "ArrowUp" }, commands, 0)).toEqual({ handled: true, nextActiveIndex: 6 });
  });

  it("selects the active command with enter", () => {
    const commands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });

    expect(commandPaletteKeyboardAction({ key: "Enter" }, commands, 2)).toEqual({ handled: true, selectCommandId: "manage-installs" });
  });

  it("clears command mode with escape", () => {
    const commands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });

    expect(commandPaletteKeyboardAction({ key: "Escape" }, commands, 2)).toEqual({ handled: true, clearQuery: true, nextActiveIndex: 0 });
  });

  it("still clears command mode with escape when no commands match", () => {
    expect(commandPaletteKeyboardAction({ key: "Escape" }, [], 0)).toEqual({ handled: true, clearQuery: true, nextActiveIndex: 0 });
  });

  it("ignores unrelated keys and empty command sets", () => {
    const commands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });

    expect(commandPaletteKeyboardAction({ key: "Tab" }, commands, 0)).toEqual({ handled: false });
    expect(commandPaletteKeyboardAction({ key: "ArrowDown" }, [], 0)).toEqual({ handled: false });
  });
});

describe("command palette query matching", () => {
  it("normalizes the explicit command search term", () => {
    expect(commandPaletteSearchTerm(">repo")).toBe("repo");
    expect(commandPaletteSearchTerm("  >Manage Installs")).toBe("manage installs");
    expect(commandPaletteSearchTerm("repo")).toBe("");
  });

  it("returns every command for a bare command trigger", () => {
    const commands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });

    expect(filterCommandPaletteCommands(commands, ">").map((command) => command.id)).toEqual([
      "search-skills",
      "open-repositories",
      "manage-installs",
      "copy-skill-path",
      "translate-summary",
      "export-gist-bundle",
      "open-settings"
    ]);
  });

  it("filters by stable command copy and disabled reason", () => {
    const enabledCommands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });
    const disabledCommands = commandPaletteCommands({ selectedDetail: null, runtime: "web" });

    expect(filterCommandPaletteCommands(enabledCommands, ">repo").map((command) => command.id)).toEqual(["open-repositories"]);
    expect(filterCommandPaletteCommands(enabledCommands, ">settings").map((command) => command.id)).toEqual(["open-settings"]);
    expect(filterCommandPaletteCommands(enabledCommands, ">install").map((command) => command.id)).toEqual(["manage-installs"]);
    expect(filterCommandPaletteCommands(enabledCommands, ">gist").map((command) => command.id)).toEqual(["export-gist-bundle"]);
    expect(filterCommandPaletteCommands(enabledCommands, ">translate").map((command) => command.id)).toEqual(["translate-summary"]);
    expect(filterCommandPaletteCommands(enabledCommands, ">path").map((command) => command.id)).toEqual(["copy-skill-path"]);
    expect(filterCommandPaletteCommands(disabledCommands, ">skill first").map((command) => command.id)).toEqual([
      "manage-installs",
      "copy-skill-path",
      "translate-summary",
      "export-gist-bundle"
    ]);
  });

  it("supports documented aliases without using dynamic titles or hint drift", () => {
    const enabledCommands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });
    const webCommands = commandPaletteCommands({ selectedDetail: detail, runtime: "web" });

    expect(filterCommandPaletteCommands(enabledCommands, ">prefs").map((command) => command.id)).toEqual(["open-settings"]);
    expect(filterCommandPaletteCommands(enabledCommands, ">source").map((command) => command.id)).toEqual(["open-repositories"]);
    expect(filterCommandPaletteCommands(enabledCommands, ">target").map((command) => command.id)).toEqual(["manage-installs"]);
    expect(filterCommandPaletteCommands(enabledCommands, ">reviewer")).toEqual([]);
    expect(filterCommandPaletteCommands(webCommands, ">require")).toEqual([]);
  });

  it("returns an empty list when no command matches", () => {
    const commands = commandPaletteCommands({ selectedDetail: detail, runtime: "desktop" });

    expect(filterCommandPaletteCommands(commands, ">publish")).toEqual([]);
  });
});

function commandActions(): CommandPaletteCommandActions {
  return {
    clearStatus: vi.fn(),
    clearQuery: vi.fn(),
    closeMenus: vi.fn(),
    focusSearch: vi.fn(),
    openRepositories: vi.fn(),
    manageInstalls: vi.fn(),
    copySkillPath: vi.fn(),
    translateSummary: vi.fn(),
    exportGistBundle: vi.fn(),
    openSettings: vi.fn(),
    setStatus: vi.fn()
  };
}

const expectedActionByCommandId = {
  "search-skills": "focusSearch",
  "open-repositories": "openRepositories",
  "manage-installs": "manageInstalls",
  "copy-skill-path": "copySkillPath",
  "translate-summary": "translateSummary",
  "export-gist-bundle": "exportGistBundle",
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
