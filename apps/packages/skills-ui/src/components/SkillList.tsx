import { useState } from "react";
import { ChevronDown, ChevronRight, Circle, FileCode2, FolderGit2 } from "lucide-react";
import type { SkillGroup, SkillSummary } from "@skills-manager/core";

export interface SkillListProps {
  groups: SkillGroup[];
  skills: SkillSummary[];
  selectedSkillId: string;
  onSelectSkill(skill: SkillSummary): void;
}

export function SkillList({ groups, skills, selectedSkillId, onSelectSkill }: SkillListProps) {
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(() => new Set());

  if (!skills.length) {
    return <div className="skills-empty">No matching skills.</div>;
  }

  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const repositoryGroups = groups
    .map((group) => ({
      group,
      items: skills.filter((skill) => skill.groupId === group.id).sort(compareSkills)
    }))
    .filter((entry) => entry.items.length > 0);

  for (const skill of skills) {
    if (!groupsById.has(skill.groupId)) {
      repositoryGroups.push({
        group: {
          id: skill.groupId,
          name: skill.groupName,
          kind: skill.groupKind,
          skillCount: 1
        },
        items: [skill]
      });
    }
  }

  return (
    <div className="skills-list">
      {repositoryGroups.map(({ group, items }) => {
        const collapsed = collapsedGroupIds.has(group.id);
        return (
          <section className="skills-list-group" key={group.id}>
            <button
              className="skills-list-group-heading skills-repository-heading"
              type="button"
              onClick={() => {
                setCollapsedGroupIds((current) => {
                  const next = new Set(current);
                  if (next.has(group.id)) {
                    next.delete(group.id);
                  } else {
                    next.add(group.id);
                  }
                  return next;
                });
              }}
            >
              <FolderGit2 size={15} />
              <span>
                <strong>{repositoryLabel(group)}</strong>
                <small>{repositoryMeta(group)}</small>
              </span>
              <b>{items.length}</b>
              {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </button>
            {collapsed
              ? null
              : items.map((skill) => (
                  <button
                    className={`skills-row ${selectedSkillId === skill.id ? "active" : ""}`}
                    key={skill.id}
                    type="button"
                    onClick={() => onSelectSkill(skill)}
                  >
                    <FileCode2 className="skills-row-icon" size={21} />
                    <div className="skills-row-copy">
                      <strong>{skill.title}</strong>
                      <span>{rowDescription(skill)}</span>
                    </div>
                    <Circle className="skills-row-status" size={8} fill="currentColor" strokeWidth={0} />
                  </button>
                ))}
          </section>
        );
      })}
    </div>
  );
}

function compareSkills(left: SkillSummary, right: SkillSummary): number {
  return left.title.localeCompare(right.title) || left.relativePath.localeCompare(right.relativePath);
}

function repositoryLabel(group: SkillGroup): string {
  if (group.id === "local:workspace") {
    return "Local skills";
  }
  return group.name;
}

function repositoryMeta(group: SkillGroup): string {
  if (group.kind === "local") {
    return "Workspace repository";
  }
  if (group.kind === "gitlab") {
    return "GitLab repository";
  }
  if (group.kind === "github-api") {
    return "GitHub API repository";
  }
  return "Git repository";
}

function rowDescription(skill: SkillSummary): string {
  const path = skill.relativeDir.replace(/\./g, "/");
  return skill.description ? `${skill.description} · ${path}` : path || skill.name;
}
