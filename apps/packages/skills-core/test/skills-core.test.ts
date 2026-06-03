import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildLibrary,
  decodeSkillId,
  encodeSkillId,
  parseSkillFile,
  searchSkills,
  type SkillFileSource,
  type SkillGroup
} from "../src";

const testDir = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(testDir, "../../../..");
const localSkillsRoot = join(repoRoot, "skills");

describe("skills-core", () => {
  const group: SkillGroup = {
    id: "local:workspace",
    name: "Local workspace",
    kind: "local"
  };

  it("parses frontmatter and heading metadata", () => {
    const detail = parseSkillFile(group, {
      relativePath: "manual/review/api-design/SKILL.md",
      content: [
        "---",
        "name: ng-review-api-design",
        "description: Review API contracts",
        "---",
        "",
        "# API Design Review",
        "",
        "Review APIs as contracts."
      ].join("\n")
    });

    expect(detail.name).toBe("ng-review-api-design");
    expect(detail.title).toBe("API Design Review");
    expect(detail.description).toBe("Review API contracts");
    expect(detail.category).toBe("manual/review");
  });

  it("round-trips stable skill ids", () => {
    const encoded = encodeSkillId("local:workspace", "manual/review/api-design/SKILL.md");
    expect(decodeSkillId(encoded)).toEqual({
      groupId: "local:workspace",
      relativePath: "manual/review/api-design/SKILL.md"
    });
  });

  it("builds a library from the current repository skills", () => {
    const sources = readLocalSkillSources();
    const library = buildLibrary([group], new Map([[group.id, sources]]));

    expect(library.groups).toEqual([{ ...group, skillCount: 24 }]);
    expect(library.skills).toHaveLength(24);
    expect(library.skills.map((skill) => skill.title)).toEqual(
      expect.arrayContaining(["API Design Review", "Ref Pack Builder", "In English"])
    );
  });

  it("searches by title, description, category, and group", () => {
    const sources = readLocalSkillSources();
    const library = buildLibrary([group], new Map([[group.id, sources]]));

    expect(searchSkills(library.skills, { query: "grammar" }).some((skill) => skill.title === "In English")).toBe(
      true
    );
    expect(searchSkills(library.skills, { query: "manual/tool", groupId: group.id }).length).toBeGreaterThan(0);
    expect(searchSkills(library.skills, { groupId: "missing" })).toHaveLength(0);
  });
});

function readLocalSkillSources(): SkillFileSource[] {
  const files: SkillFileSource[] = [];
  walk(localSkillsRoot, (file) => {
    if (!file.endsWith("/SKILL.md")) {
      return;
    }
    const relativePath = relative(localSkillsRoot, file).split("\\").join("/");
    const manifestPath = file.replace(/SKILL\.md$/, "skill.yaml");
    let manifestContent: string | undefined;
    try {
      manifestContent = readFileSync(manifestPath, "utf8");
    } catch {
      manifestContent = undefined;
    }
    files.push({
      relativePath,
      content: readFileSync(file, "utf8"),
      manifestContent,
      absolutePath: file
    });
  });
  return files;
}

function walk(directory: string, onFile: (file: string) => void): void {
  for (const entry of readdirSync(directory)) {
    if (entry.startsWith(".") || entry === "node_modules" || entry === "__pycache__") {
      continue;
    }
    const path = join(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path, onFile);
    } else {
      onFile(path);
    }
  }
}
