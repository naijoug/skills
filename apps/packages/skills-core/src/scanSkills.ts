import { parseSkillFile, toSkillSummary } from "./parseSkill";
import type { SkillDetail, SkillFileSource, SkillGroup, SkillSummary, SkillsLibrary } from "./types";

export function parseSkillFiles(group: SkillGroup, sources: SkillFileSource[]): SkillDetail[] {
  return sources.map((source) => parseSkillFile(group, source)).sort(compareSkillDetails);
}

export function summarizeSkillFiles(group: SkillGroup, sources: SkillFileSource[]): SkillSummary[] {
  return parseSkillFiles(group, sources).map(toSkillSummary);
}

export function buildLibrary(groups: SkillGroup[], filesByGroup: Map<string, SkillFileSource[]>): SkillsLibrary {
  const hydratedGroups: SkillGroup[] = [];
  const skills: SkillSummary[] = [];

  for (const group of groups) {
    const groupSkills = summarizeSkillFiles(group, filesByGroup.get(group.id) ?? []);
    hydratedGroups.push({ ...group, skillCount: groupSkills.length });
    skills.push(...groupSkills);
  }

  return {
    groups: hydratedGroups,
    skills: skills.sort((left, right) => left.title.localeCompare(right.title) || left.groupName.localeCompare(right.groupName))
  };
}

function compareSkillDetails(left: SkillDetail, right: SkillDetail): number {
  return left.title.localeCompare(right.title) || left.relativePath.localeCompare(right.relativePath);
}
