import { useState } from "react";
import { ChevronDown, ChevronRight, Circle, FileCode2 } from "lucide-react";
import type { SkillSummary } from "@skills-manager/core";

export interface SkillListProps {
  skills: SkillSummary[];
  selectedSkillId: string;
  sortDirection: "asc" | "desc";
  onSelectSkill(skill: SkillSummary): void;
}

export function SkillList({ skills, selectedSkillId, sortDirection, onSelectSkill }: SkillListProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set());

  if (!skills.length) {
    return (
      <div className="skills-empty">
        <h2>No matching skills</h2>
        <p>Try a different search or repository.</p>
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
                      <strong>{skill.title}</strong>
                      <small>{rowDescription(skill)}</small>
                    </span>
                    <Circle className="skills-row-status" size={8} fill="currentColor" strokeWidth={0} aria-hidden="true" />
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
