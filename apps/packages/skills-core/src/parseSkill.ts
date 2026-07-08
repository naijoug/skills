import { encodeSkillId } from "./ids";
import type { SkillDetail, SkillFileSource, SkillGroup, SkillSummary } from "./types";

export function parseSimpleYaml(text: string): Record<string, string> {
  const values: Record<string, string> = {};
  let listKey = "";
  for (const line of text.split(/\r?\n/)) {
    const stripped = line.trim();
    if (!stripped || stripped.startsWith("#") || !stripped.includes(":")) {
      if (stripped.startsWith("- ") && listKey) {
        values[listKey] = compactDescription(`${values[listKey] || ""} ${stripYamlQuotes(stripped.slice(2).trim())}`);
      }
      continue;
    }
    const [rawKey, ...rest] = stripped.split(":");
    const key = rawKey.trim();
    const value = stripYamlQuotes(rest.join(":").trim());
    if (key) {
      values[key] = value;
      listKey = value ? "" : key;
    }
  }
  return values;
}

function stripYamlQuotes(value: string): string {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function splitFrontmatter(markdown: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  if (!markdown.startsWith("---")) {
    return { frontmatter: {}, body: markdown };
  }
  const lines = markdown.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") {
    return { frontmatter: {}, body: markdown };
  }
  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (endIndex < 0) {
    return { frontmatter: {}, body: markdown };
  }
  return {
    frontmatter: parseSimpleYaml(lines.slice(1, endIndex).join("\n")),
    body: lines.slice(endIndex + 1).join("\n").replace(/^\n+/, "")
  };
}

export function firstHeading(markdown: string): string {
  for (const line of markdown.split(/\r?\n/)) {
    const stripped = line.trim();
    if (stripped.startsWith("#")) {
      return stripped.replace(/^#+/, "").trim();
    }
  }
  return "";
}

export function firstParagraph(markdown: string): string {
  const { body } = splitFrontmatter(markdown);
  const chunks: string[] = [];
  let inCode = false;

  for (const line of body.split(/\r?\n/)) {
    const stripped = line.trim();
    if (stripped.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode || stripped.startsWith("#") || stripped.startsWith("-")) {
      continue;
    }
    if (stripped) {
      chunks.push(stripped);
    } else if (chunks.length) {
      break;
    }
  }

  return compactDescription(chunks.join(" ")).slice(0, 320);
}

export function compactDescription(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function categoryFor(relativePath: string): string {
  let parts = relativePath.split("/").slice(0, -1);
  if (parts[0] === "skills") {
    parts = parts.slice(1);
  }
  if (parts.length > 1) {
    parts = parts.slice(0, -1);
  }
  return parts.join("/") || "uncategorized";
}

export function parseSkillFile(group: SkillGroup, source: SkillFileSource): SkillDetail {
  const { frontmatter, body } = splitFrontmatter(source.content);
  const manifest = source.manifestContent ? parseSimpleYaml(source.manifestContent) : {};
  const relativeDir = source.relativePath.split("/").slice(0, -1).join(".");
  const title = compactDescription(
    manifest.title ||
      frontmatter.title ||
      firstHeading(body) ||
      frontmatter.name ||
      manifest.id ||
      source.relativePath.split("/").at(-2) ||
      "Untitled Skill"
  );
  const name = compactDescription(frontmatter.name || manifest.id || title);
  const description = compactDescription(frontmatter.description || manifest.summary || firstParagraph(source.content));
  const searchText = compactDescription([...Object.values(manifest), ...Object.values(frontmatter), source.relativePath].join(" "));

  return {
    id: encodeSkillId(group.id, source.relativePath),
    name,
    title,
    description,
    category: categoryFor(source.relativePath),
    searchText,
    relativePath: source.relativePath,
    relativeDir,
    groupId: group.id,
    groupName: group.name,
    groupKind: group.kind,
    content: source.content,
    frontmatter,
    manifest,
    relatedFiles: source.relatedFiles ?? [],
    absolutePath: source.absolutePath
  };
}

export function toSkillSummary(detail: SkillDetail): SkillSummary {
  const {
    content: _content,
    frontmatter: _frontmatter,
    manifest: _manifest,
    relatedFiles: _relatedFiles,
    absolutePath: _absolutePath,
    ...summary
  } = detail;
  return summary;
}
