import type { ReactNode } from "react";
import { Circle, Clock3, FileCode2, Folder, GitBranch, Lightbulb, Link2, ListChecks, Monitor, Target, Users } from "lucide-react";
import type { SkillDetail, SkillRelatedFile } from "@skills-manager/core";

export type SkillDetailTab = "summary" | "markdown" | "files" | "install";

export interface SkillDetailViewProps {
  detail: SkillDetail | null;
  activeTab: SkillDetailTab;
  platformLabel: string;
  capabilityText: string;
  installPanel?: ReactNode;
  summaryTranslationPanel?: ReactNode;
  markdownTranslationPanel?: ReactNode;
  onActiveTabChange(tab: SkillDetailTab): void;
}

const detailTabs: Array<{ id: SkillDetailTab; label: string }> = [
  { id: "summary", label: "Summary" },
  { id: "markdown", label: "Markdown" },
  { id: "files", label: "Files" },
  { id: "install", label: "Install" }
];

export function SkillDetailView({
  detail,
  activeTab,
  platformLabel,
  capabilityText,
  installPanel,
  summaryTranslationPanel,
  markdownTranslationPanel,
  onActiveTabChange
}: SkillDetailViewProps) {
  if (!detail) {
    return (
      <div className="skills-empty detail">
        <h2>Select a skill</h2>
        <p>Summary, Markdown, files, and install actions will appear here.</p>
      </div>
    );
  }

  return (
    <article className="skills-detail">
      <header className="skills-detail-header">
        <div className="skills-detail-title-row">
          <div>
            <div className="skills-detail-name">
              <h2>{detail.title}</h2>
              <span>Installed</span>
            </div>
            <p>{detail.description || detail.name}</p>
          </div>
          <div className="skills-capability-card">
            <Monitor size={22} />
            <div>
              <strong>{platformLabel}</strong>
              <span>
                <Circle size={8} fill="currentColor" strokeWidth={0} />
                {capabilityText}
              </span>
            </div>
          </div>
        </div>
        <div className="skills-meta-stack">
          <div className="skills-meta-grid">
            <MetaItem icon={<Folder size={18} />} value={formatPath(detail.relativeDir)} />
            <MetaItem value={formatCategory(detail.category)} variant="chip" />
            <MetaItem icon={<Users size={18} />} value={detail.groupName} />
          </div>
          <div className="skills-meta-grid secondary">
            <MetaItem icon={<GitBranch size={18} />} value={repositoryLabel(detail)} />
            <span className="skills-meta-separator" aria-hidden="true" />
            <MetaItem icon={<Clock3 size={17} />} value="Updated 3 days ago" />
          </div>
        </div>
      </header>

      <nav className="skills-tabs" aria-label="Skill detail sections">
        {detailTabs.map((tab) => (
          <button
            className={activeTab === tab.id ? "active" : ""}
            key={tab.id}
            type="button"
            onClick={() => onActiveTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="skills-tab-panel">
        {activeTab === "summary" ? (
          <div className="skills-detail-section-stack">
            <SkillSummaryView detail={detail} />
            {summaryTranslationPanel}
          </div>
        ) : null}
        {activeTab === "markdown" ? (
          <div className="skills-detail-section-stack">
            <pre className="skills-markdown-source">{detail.content}</pre>
            {markdownTranslationPanel}
          </div>
        ) : null}
        {activeTab === "files" ? <SkillFilesView files={detail.relatedFiles ?? []} /> : null}
        {activeTab === "install" ? installPanel : null}
      </div>
    </article>
  );
}

function SkillFilesView({ files }: { files: SkillRelatedFile[] }) {
  if (!files.length) {
    return (
      <div className="skills-empty">
        <h2>No related files</h2>
        <p>This skill only exposes its SKILL.md file.</p>
      </div>
    );
  }

  const groups = files.reduce<Array<{ kind: string; items: SkillRelatedFile[] }>>((entries, file) => {
    const existing = entries.find((entry) => entry.kind === file.kind);
    if (existing) {
      existing.items.push(file);
    } else {
      entries.push({ kind: file.kind, items: [file] });
    }
    return entries;
  }, []);

  return (
    <div className="skills-files-view">
      {groups.map((group) => (
        <section className="skills-files-group" key={group.kind}>
          <h3>{formatFileKind(group.kind)}</h3>
          <div className="skills-files-grid">
            {group.items.map((file) => (
              <article className="skills-file-card" key={file.relativePath}>
                <div className="skills-file-card-header">
                  <FileCode2 size={16} />
                  <strong>{file.relativePath}</strong>
                  {typeof file.sizeBytes === "number" ? <span>{formatBytes(file.sizeBytes)}</span> : null}
                </div>
                {file.content ? <pre>{file.content}</pre> : <p>Preview unavailable for this file type.</p>}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function formatFileKind(kind: string): string {
  const labels: Record<string, string> = {
    markdown: "Markdown",
    reference: "References",
    code: "Code",
    config: "Configuration",
    asset: "Assets",
    other: "Other files"
  };
  return labels[kind] ?? kind;
}

function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function MetaItem({ icon, value, variant }: { icon?: ReactNode; value: string; variant?: "chip" }) {
  return (
    <div className={`skills-meta-item ${variant === "chip" ? "chip" : ""}`}>
      {icon}
      <strong>{value}</strong>
    </div>
  );
}

function SkillSummaryView({ detail }: { detail: SkillDetail }) {
  const sections = extractSummarySections(detail.content);

  if (!sections.length) {
    return (
      <div className="skills-summary-section">
        <h3>Overview</h3>
        <p>{detail.description || "This skill has no structured summary yet. Open Markdown to read the full skill definition."}</p>
      </div>
    );
  }

  return (
    <div className="skills-summary">
      {sections.map((section, index) => (
        <section className="skills-summary-section" key={`${section.title}-${index}`}>
          <div className="skills-summary-icon" aria-hidden="true">
            <SectionIcon title={section.title} />
          </div>
          <div>
            <h3>{section.title}</h3>
            <SummaryLines lines={section.lines} />
          </div>
        </section>
      ))}
    </div>
  );
}

function SummaryLines({ lines }: { lines: string[] }) {
  const cleanedLines = lines.map(cleanSummaryLine).filter(Boolean).slice(0, 8);
  const listLines = cleanedLines.filter((line) => /^(-|\*|\d+\.)\s+/.test(line));
  const orderedList = listLines.length > 0 && listLines.every((line) => /^\d+\.\s+/.test(line));

  if (!cleanedLines.length) {
    return <p>No summary content in this section.</p>;
  }

  if (listLines.length >= Math.max(2, cleanedLines.length - 1)) {
    const ListTag = orderedList ? "ol" : "ul";
    return <ListTag>{cleanedLines.map((line) => <li key={line}>{line.replace(/^(-|\*|\d+\.)\s+/, "")}</li>)}</ListTag>;
  }

  return (
    <>
      {cleanedLines.slice(0, 3).map((line) => (
        <p key={line}>{line}</p>
      ))}
    </>
  );
}

function extractSummarySections(content: string): Array<{ title: string; lines: string[] }> {
  const body = stripFrontmatter(content);
  const lines = body.split(/\r?\n/);
  const sections: Array<{ title: string; lines: string[] }> = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    const heading = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (heading) {
      if (current && current.lines.some((sectionLine) => sectionLine.trim())) {
        sections.push(current);
      }
      current = { title: heading[2].trim(), lines: [] };
      continue;
    }
    if (current) {
      current.lines.push(line);
    }
  }

  if (current && current.lines.some((line) => line.trim())) {
    sections.push(current);
  }

  const preferredSections = sections.filter((section) => {
    const normalizedTitle = section.title.toLowerCase();
    return /(overview|purpose|when to use|workflow|steps|references|usage|setup)/.test(normalizedTitle);
  });

  return (preferredSections.length ? preferredSections : sections).slice(0, 4);
}

function stripFrontmatter(content: string): string {
  const lines = content.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") {
    return content;
  }
  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  return closingIndex === -1 ? content : lines.slice(closingIndex + 1).join("\n");
}

function cleanSummaryLine(line: string): string {
  return line.trim().replace(/^>\s?/, "").replace(/`/g, "");
}

function repositoryLabel(detail: SkillDetail): string {
  if (detail.groupName === "core-skills") {
    return "acme/skills";
  }
  if (detail.groupKind === "github" || detail.groupKind === "github-api") {
    return detail.groupName;
  }
  return "acme/skills";
}

function formatPath(value: string): string {
  return value.replace(/\./g, "/");
}

function formatCategory(value: string): string {
  return value
    .split(/[-/]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function SectionIcon({ title }: { title: string }) {
  const normalizedTitle = title.toLowerCase();
  if (/when|use|usage/.test(normalizedTitle)) {
    return <Lightbulb size={28} />;
  }
  if (/steps|workflow|setup/.test(normalizedTitle)) {
    return <ListChecks size={28} />;
  }
  if (/references|links/.test(normalizedTitle)) {
    return <Link2 size={28} />;
  }
  return <Target size={28} />;
}
