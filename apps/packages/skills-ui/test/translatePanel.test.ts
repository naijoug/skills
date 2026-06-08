import { describe, expect, it } from "vitest";
import type { SkillDetail } from "@skills-manager/core";
import { buildTranslateSkillInput, translationSourceMarkdown } from "../src/components/TranslatePanel";

describe("TranslatePanel helpers", () => {
  const detail: SkillDetail = {
    id: "skill-id",
    name: "api-design",
    title: "API Design Review",
    description: "Review API contracts.",
    category: "manual/review",
    relativePath: "manual/review/api-design/SKILL.md",
    relativeDir: "manual/review/api-design",
    groupId: "local:workspace",
    groupName: "Local workspace",
    groupKind: "local",
    content: [
      "# API Design Review",
      "",
      "Full markdown body.",
      "",
      "## Overview",
      "",
      "Detailed overview.",
      "",
      "## References",
      "",
      "- references/checklist.md",
      "",
      "## Install",
      "",
      "Install instructions."
    ].join("\n"),
    frontmatter: {},
    manifest: {},
    relatedFiles: []
  };

  it("builds a summary translation source from the title, description, and references", () => {
    expect(translationSourceMarkdown(detail, "summary")).toBe(
      ["# API Design Review", "Review API contracts.", "## References\n\n- references/checklist.md"].join("\n\n")
    );
  });

  it("uses the full markdown source for markdown translations", () => {
    expect(translationSourceMarkdown(detail, "markdown")).toBe(detail.content);
  });

  it("passes sourceMode through in translation requests", () => {
    expect(buildTranslateSkillInput(detail, " Chinese ", "openrouter", "markdown")).toEqual({
      skillId: "skill-id",
      targetLanguage: "Chinese",
      providerId: "openrouter",
      sourceMode: "markdown"
    });
  });
});
