const SEPARATOR = "::";

export function encodeSkillId(groupId: string, relativePath: string): string {
  return `${encodeURIComponent(groupId)}${SEPARATOR}${encodeURIComponent(relativePath)}`;
}

export function decodeSkillId(skillId: string): { groupId: string; relativePath: string } {
  const separatorIndex = skillId.indexOf(SEPARATOR);
  if (separatorIndex < 0) {
    throw new Error("Invalid skill id");
  }
  return {
    groupId: decodeURIComponent(skillId.slice(0, separatorIndex)),
    relativePath: decodeURIComponent(skillId.slice(separatorIndex + SEPARATOR.length))
  };
}
