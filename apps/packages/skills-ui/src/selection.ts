import type { SkillGroup, SkillSummary, SkillsLibrary } from "@skills-manager/core";
import { searchSkills } from "@skills-manager/core";

export function skillsForView(library: SkillsLibrary, groupId: string, query: string): SkillSummary[] {
  return searchSkills(library.skills, {
    query,
    groupId: groupId === "all" ? undefined : groupId
  });
}

export function firstSkillForView(library: SkillsLibrary, groupId: string, query: string): SkillSummary | undefined {
  return skillsForView(library, groupId, query)[0];
}

export function selectedSkillForView(
  library: SkillsLibrary,
  groupId: string,
  query: string,
  selectedSkillId: string
): SkillSummary | undefined {
  const viewSkills = skillsForView(library, groupId, query);
  return viewSkills.find((skill) => skill.id === selectedSkillId) ?? viewSkills[0];
}

export function findImportedGroup(previousLibrary: SkillsLibrary, nextLibrary: SkillsLibrary): SkillGroup | undefined {
  const previousGroupIds = new Set(previousLibrary.groups.map((group) => group.id));
  return (
    nextLibrary.groups.find((group) => group.kind !== "local" && !previousGroupIds.has(group.id)) ??
    [...nextLibrary.groups].reverse().find((group) => group.kind !== "local")
  );
}

export function groupAfterRefresh(library: SkillsLibrary, selectedGroupId: string): string {
  if (selectedGroupId === "all" || library.groups.some((group) => group.id === selectedGroupId)) {
    return selectedGroupId;
  }
  return "all";
}
