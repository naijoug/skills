import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { SkillDetail, SkillSummary } from "@skills-manager/core";
import { SkillDetailView } from "../src/components/SkillDetailView";
import { SkillList } from "../src/components/SkillList";

describe("detail component rendering", () => {
  it("keeps the detail toolbar focused on one primary action plus overflow", () => {
    const markup = renderToStaticMarkup(
      <SkillDetailView
        activeTab="summary"
        capabilityText="Desktop install target available"
        detail={detail}
        detailActions={
          <div className="skills-detail-actions">
            <button className="skills-primary-action" type="button" aria-label="Manage installs for selected skill">
              <span>Manage installs</span>
            </button>
            <button className="skills-icon-action" type="button" aria-label="More skill actions">
              More
            </button>
          </div>
        }
        platformLabel="Desktop"
        onActiveTabChange={() => undefined}
      />
    );

    expect(markup).toContain("Manage installs");
    expect(markup).toContain("aria-label=\"More skill actions\"");
    expect(markup).not.toContain("aria-label=\"Copy skill path\"");
  });

  it("marks the selected skill row and keeps row metadata visible", () => {
    const markup = renderToStaticMarkup(
      <SkillList skills={[localSkill, importedSkill]} selectedSkillId={importedSkill.id} sortDirection="asc" onSelectSkill={() => undefined} />
    );

    expect(markup).toContain("skills-row active");
    expect(markup).toContain("Repo Reviewer");
    expect(markup).toContain("Review imported repositories.");
    expect(markup).toContain("External Repo");
    expect(markup).toContain("manual/review/repo-review");
    expect(markup).toContain("Manual Review");
  });

  it("renders detail metadata, selected tab, and the install entry when install is active", () => {
    const markup = renderToStaticMarkup(
      <SkillDetailView
        activeTab="install"
        capabilityText="Desktop install target available"
        detail={detail}
        installPanel={<section>Install target chooser</section>}
        platformLabel="Desktop"
        updatedAt="2026-08-24T00:00:00.000Z"
        onActiveTabChange={() => undefined}
      />
    );

    expect(markup).toContain("Repo Reviewer");
    expect(markup).toContain("Review imported repositories.");
    expect(markup).toContain("Manual Review");
    expect(markup).toContain("External Repo");
    expect(markup).toContain("Updated Aug 24, 2026");
    expect(markup).toContain("manual/review/repo-review");
    expect(markup).toContain("class=\"active\" type=\"button\">Install");
    expect(markup).toContain("Install target chooser");
  });
});

const localSkill: SkillSummary = {
  id: "local-review",
  name: "local-review",
  title: "Local Reviewer",
  description: "Review local workspace changes.",
  category: "manual/review",
  relativePath: "manual/review/local-review/SKILL.md",
  relativeDir: "manual/review/local-review",
  groupId: "local",
  groupName: "Local skills",
  groupKind: "local"
};

const importedSkill: SkillSummary = {
  id: "repo-review",
  name: "repo-review",
  title: "Repo Reviewer",
  description: "Review imported repositories.",
  category: "manual/review",
  relativePath: "manual/review/repo-review/SKILL.md",
  relativeDir: "manual/review/repo-review",
  groupId: "external",
  groupName: "External Repo",
  groupKind: "github"
};

const detail: SkillDetail = {
  ...importedSkill,
  content: "# Repo Reviewer\n\n## Workflow\n\n- Inspect the repo\n- Report risk",
  frontmatter: {},
  manifest: {},
  relatedFiles: []
};
