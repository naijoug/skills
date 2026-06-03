import { describe, expect, it } from "vitest";
import type { InstallStatus, InstallTarget } from "@skills-manager/core";
import { nextSelectedInstallTargetIds } from "../src/installSelection";

const codex = target("codex-global");
const claude = target("claude-code-global");

describe("install selection helpers", () => {
  it("resets to installed targets when the selected skill changes", () => {
    expect(
      nextSelectedInstallTargetIds({
        currentTargetIds: [codex.id],
        targets: [codex, claude],
        statuses: [status(claude.id, true)],
        resetSelection: true
      })
    ).toEqual([claude.id]);
  });

  it("clears stale target selections for uninstalled skills on reset", () => {
    expect(
      nextSelectedInstallTargetIds({
        currentTargetIds: [codex.id],
        targets: [codex, claude],
        statuses: [status(codex.id, false), status(claude.id, false)],
        resetSelection: true
      })
    ).toEqual([]);
  });

  it("preserves valid manual selections during same-skill refreshes", () => {
    expect(
      nextSelectedInstallTargetIds({
        currentTargetIds: [codex.id],
        targets: [codex, claude],
        statuses: [status(claude.id, true)],
        resetSelection: false
      })
    ).toEqual([codex.id]);
  });

  it("falls back to installed targets when a selected target no longer exists", () => {
    expect(
      nextSelectedInstallTargetIds({
        currentTargetIds: ["removed-target"],
        targets: [codex, claude],
        statuses: [status(claude.id, true)],
        resetSelection: false
      })
    ).toEqual([claude.id]);
  });
});

function target(id: string): InstallTarget {
  return {
    id,
    toolId: id.split("-")[0],
    label: id,
    skillsDir: `/tmp/${id}`,
    exists: true
  };
}

function status(targetId: string, installed: boolean): InstallStatus {
  return {
    skillId: "skill",
    targetId,
    installed,
    conflict: false,
    destinationPath: `/tmp/${targetId}/skill`
  };
}
