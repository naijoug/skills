import { describe, expect, it } from "vitest";
import type { SkillGroup, SkillSummary, SkillsLibrary } from "@skills-manager/core";
import { findImportedGroup, groupAfterRefresh, selectedSkillForView, skillsForView } from "../src/selection";

const localGroup: SkillGroup = { id: "local", name: "Local", kind: "local" };
const repoGroup: SkillGroup = { id: "repo-a", name: "Repo A", kind: "github", url: "https://github.com/acme/a" };
const repoGroupB: SkillGroup = { id: "repo-b", name: "Repo B", kind: "github-api", url: "https://github.com/acme/b" };

const skillA = skill("a", "Local formatter", localGroup);
const skillB = skill("b", "Repo deploy", repoGroup);
const skillC = skill("c", "Repo reviewer", repoGroupB);

describe("selection helpers", () => {
  it("filters visible skills by group and query", () => {
    const library = libraryWith([localGroup, repoGroup], [skillA, skillB]);

    expect(skillsForView(library, "all", "")).toEqual([skillA, skillB]);
    expect(skillsForView(library, repoGroup.id, "")).toEqual([skillB]);
    expect(skillsForView(library, "all", "formatter")).toEqual([skillA]);
  });

  it("keeps the selected skill only when it remains visible, otherwise falls back to the first visible skill", () => {
    const library = libraryWith([localGroup, repoGroup], [skillA, skillB]);

    expect(selectedSkillForView(library, "all", "", skillB.id)).toEqual(skillB);
    expect(selectedSkillForView(library, localGroup.id, "", skillB.id)).toEqual(skillA);
    expect(selectedSkillForView(library, localGroup.id, "missing", skillB.id)).toBeUndefined();
  });

  it("selects newly imported repository groups ahead of existing imported groups", () => {
    const before = libraryWith([localGroup, repoGroup], [skillA, skillB]);
    const after = libraryWith([localGroup, repoGroup, repoGroupB], [skillA, skillB, skillC]);

    expect(findImportedGroup(before, after)).toEqual(repoGroupB);
  });

  it("falls back to the latest imported group when an import updates an existing repository", () => {
    const before = libraryWith([localGroup, repoGroup, repoGroupB], [skillA, skillB, skillC]);
    const after = libraryWith([localGroup, repoGroup, repoGroupB], [skillA, skillB, skillC]);

    expect(findImportedGroup(before, after)).toEqual(repoGroupB);
  });

  it("falls back to all skills when a refreshed library no longer contains the selected group", () => {
    const refreshed = libraryWith([localGroup], [skillA]);

    expect(groupAfterRefresh(refreshed, repoGroup.id)).toBe("all");
    expect(groupAfterRefresh(refreshed, localGroup.id)).toBe(localGroup.id);
    expect(groupAfterRefresh(refreshed, "all")).toBe("all");
  });
});

function libraryWith(groups: SkillGroup[], skills: SkillSummary[]): SkillsLibrary {
  return { groups, skills };
}

function skill(id: string, title: string, group: SkillGroup): SkillSummary {
  return {
    id,
    name: id,
    title,
    description: `${title} description`,
    category: "manual",
    relativePath: `${id}/SKILL.md`,
    relativeDir: id,
    groupId: group.id,
    groupName: group.name,
    groupKind: group.kind
  };
}
