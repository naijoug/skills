import { describe, expect, it } from "vitest";
import type { SkillDetail } from "@skills-manager/core";
import { commandPaletteCommands } from "../src/commandPaletteCommands";

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
