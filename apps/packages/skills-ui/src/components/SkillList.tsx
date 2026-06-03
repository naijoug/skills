import type { SkillSummary } from "@skills-manager/core";

export interface SkillListProps {
  skills: SkillSummary[];
  selectedSkillId: string;
  onSelectSkill(skill: SkillSummary): void;
}

export function SkillList({ skills, selectedSkillId, onSelectSkill }: SkillListProps) {
  if (!skills.length) {
    return <div className="skills-empty">No matching skills.</div>;
  }

  return (
    <div className="skills-list">
      {skills.map((skill) => (
        <button
          className={`skills-row ${selectedSkillId === skill.id ? "active" : ""}`}
          key={skill.id}
          type="button"
          onClick={() => onSelectSkill(skill)}
        >
          <strong>{skill.title}</strong>
          <span>{skill.description || skill.name}</span>
          <div>
            <small>{skill.category}</small>
            <small>{skill.groupName}</small>
          </div>
        </button>
      ))}
    </div>
  );
}
