import type { SkillDetail, SkillRelatedFile } from "@skills-manager/core";

export function gistBundleForDetail(detail: SkillDetail): string {
  const sections = [
    `# ${detail.title}`,
    "",
    `Source: ${detail.groupName} / ${detail.relativePath}`,
    "",
    "## SKILL.md",
    "",
    "```markdown",
    detail.content.trim(),
    "```"
  ];
  if (detail.relatedFiles.length) {
    sections.push("", "## Related files");
    for (const file of detail.relatedFiles) {
      sections.push("", `### ${file.relativePath}`, "", fileContentForGist(file));
    }
  }
  return `${sections.join("\n")}\n`;
}

function fileContentForGist(file: SkillRelatedFile): string {
  if (!file.content) {
    return `_No text preview available. Kind: ${file.kind}${typeof file.sizeBytes === "number" ? `, size: ${file.sizeBytes} bytes` : ""}._`;
  }
  return ["```", file.content.trim(), "```"].join("\n");
}
