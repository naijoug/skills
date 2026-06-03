import type { SkillDetail } from "@skills-manager/core";

export interface SkillDetailViewProps {
  detail: SkillDetail | null;
}

export function SkillDetailView({ detail }: SkillDetailViewProps) {
  if (!detail) {
    return (
      <div className="skills-empty detail">
        <h2>Select a skill</h2>
        <p>Details, translation, and install actions will appear here.</p>
      </div>
    );
  }

  return (
    <article className="skills-detail">
      <header>
        <p>
          {detail.groupName} / {detail.relativeDir}
        </p>
        <h2>{detail.title}</h2>
        <span>{detail.description}</span>
      </header>
      <pre>{detail.content}</pre>
    </article>
  );
}
