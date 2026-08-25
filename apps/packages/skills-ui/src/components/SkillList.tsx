import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, FileCode2 } from "lucide-react";
import type { SkillSummary } from "@skills-manager/core";

export interface SkillListProps {
  skills: SkillSummary[];
  selectedSkillId: string;
  sortDirection: "asc" | "desc";
  query?: string;
  groupName?: string;
  onSelectSkill(skill: SkillSummary): void;
  onClearSearch?(): void;
  onViewAllSkills?(): void;
}

export function SkillList({
  skills,
  selectedSkillId,
  sortDirection,
  query = "",
  groupName = "All skills",
  onSelectSkill,
  onClearSearch,
  onViewAllSkills
}: SkillListProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set());

  if (!skills.length) {
    return (
      <div className="skills-empty">
        <h2>No matching skills</h2>
        <p>{emptyStateMessage(query, groupName)}</p>
        {query || groupName !== "All skills" ? (
          <div className="skills-empty-actions">
            {query ? (
              <button type="button" onClick={onClearSearch}>
                Clear search
              </button>
            ) : null}
            {groupName !== "All skills" ? (
              <button type="button" onClick={onViewAllSkills}>
                View all skills
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  const sections = [
    { id: "local", label: "Local skills", items: skills.filter((skill) => skill.groupKind === "local") },
    { id: "imported", label: "Imported", items: skills.filter((skill) => skill.groupKind !== "local") }
  ]
    .map((section) => ({
      ...section,
      items: section.items.sort((left, right) => compareSkills(left, right) * (sortDirection === "asc" ? 1 : -1))
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="skills-list">
      {sections.map((section) => {
        const collapsed = collapsedSections.has(section.id);
        return (
          <section className="skills-list-group" key={section.id}>
            <button
              className="skills-list-group-heading"
              type="button"
              aria-expanded={!collapsed}
              onClick={() => {
                setCollapsedSections((current) => {
                  const next = new Set(current);
                  if (next.has(section.id)) {
                    next.delete(section.id);
                  } else {
                    next.add(section.id);
                  }
                  return next;
                });
              }}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              <strong>{section.label}</strong>
              <span>{section.items.length}</span>
            </button>
            {!collapsed && section.id === "local" ? <p className="skills-list-group-note">Workspace repository</p> : null}
            {collapsed ? null : (
              <div className="skills-list-group-items">
                {section.items.map((skill) => (
                  <button
                    className={`skills-row ${selectedSkillId === skill.id ? "active" : ""}`}
                    key={skill.id}
                    type="button"
                    onClick={() => onSelectSkill(skill)}
                  >
                    <FileCode2 className="skills-row-icon" size={20} strokeWidth={1.7} />
                    <span className="skills-row-copy">
                      <span className="skills-row-title-line">
                        <strong>{skill.title}</strong>
                        <span className="skills-row-category">{formatCategory(skill.category)}</span>
                      </span>
                      <small>{rowDescription(skill)}</small>
                      <span className="skills-row-meta" aria-label={`${skill.groupName}, ${skill.relativePath}`}>
                        <span>{sourceLabel(skill)}</span>
                        <span aria-hidden="true">·</span>
                        <code>{formatPath(skill.relativeDir || skill.relativePath)}</code>
                      </span>
                    </span>
                    <span className="skills-row-status" title={skill.groupKind === "local" ? "Local skill" : "Imported skill"}>
                      <CheckCircle2 size={15} strokeWidth={1.9} aria-hidden="true" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function compareSkills(left: SkillSummary, right: SkillSummary): number {
  return left.title.localeCompare(right.title) || left.relativePath.localeCompare(right.relativePath);
}

function rowDescription(skill: SkillSummary): string {
  return skill.description || skill.relativeDir.replace(/\./g, "/") || skill.name;
}

function sourceLabel(skill: SkillSummary): string {
  return skill.groupKind === "local" ? "Local" : skill.groupName;
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

function emptyStateMessage(query: string, groupName: string): string {
  const trimmedQuery = query.trim();
  if (trimmedQuery && groupName !== "All skills") {
    return `No results for “${trimmedQuery}” in ${groupName}.`;
  }
  if (trimmedQuery) {
    return `No results for “${trimmedQuery}”.`;
  }
  if (groupName !== "All skills") {
    return `${groupName} has no skills in this library.`;
  }
  return "Try a different search or repository.";
}
