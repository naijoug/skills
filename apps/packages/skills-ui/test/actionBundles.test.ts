import { describe, expect, it } from "vitest";
import type { SkillDetail } from "@skills-manager/core";
import { gistBundleForDetail } from "../src/actionBundles";

describe("action bundles", () => {
  it("creates a Gist-ready bundle with SKILL.md and related files", () => {
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
      content: "# API Design Review\n\nReview APIs as contracts.",
      frontmatter: {},
      manifest: {},
      relatedFiles: [
        {
          relativePath: "manual/review/api-design/references/checklist.md",
          kind: "reference",
          sizeBytes: 24,
          content: "# Checklist\n\n- Versioning"
        },
        {
          relativePath: "manual/review/api-design/assets/diagram.png",
          kind: "asset",
          sizeBytes: 4096
        }
      ]
    };

    expect(gistBundleForDetail(detail)).toContain("## SKILL.md");
    expect(gistBundleForDetail(detail)).toContain("manual/review/api-design/references/checklist.md");
    expect(gistBundleForDetail(detail)).toContain("# Checklist");
    expect(gistBundleForDetail(detail)).toContain("Kind: asset, size: 4096 bytes");
  });
});
