import type { SkillSummary } from "./types";

export interface SkillSearchOptions {
  query?: string;
  groupId?: string;
}

export function searchSkills(skills: SkillSummary[], options: SkillSearchOptions = {}): SkillSummary[] {
  const query = options.query?.trim().toLowerCase();
  return skills.filter((skill) => {
    if (options.groupId && skill.groupId !== options.groupId) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack = [
      skill.title,
      skill.name,
      skill.description,
      skill.category,
      skill.groupName,
      skill.relativePath
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
