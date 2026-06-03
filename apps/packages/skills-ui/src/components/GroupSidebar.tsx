import type { SkillGroup } from "@skills-manager/core";

export interface GroupSidebarProps {
  groups: SkillGroup[];
  totalSkills: number;
  selectedGroupId: string;
  onSelectGroup(groupId: string): void;
}

export function GroupSidebar({ groups, totalSkills, selectedGroupId, onSelectGroup }: GroupSidebarProps) {
  return (
    <aside className="skills-sidebar">
      <div className="skills-brand">
        <div className="skills-brand-mark">SM</div>
        <div>
          <h1>Skills Manager</h1>
          <p>Web/Desktop monorepo</p>
        </div>
      </div>
      <nav aria-label="Skill groups">
        <GroupButton
          id="all"
          name="All skills"
          subtitle="Across imported groups"
          count={totalSkills}
          active={selectedGroupId === "all"}
          onClick={() => onSelectGroup("all")}
        />
        {groups.map((group) => (
          <GroupButton
            key={group.id}
            id={group.id}
            name={group.name}
            subtitle={group.kind}
            count={group.skillCount ?? 0}
            active={selectedGroupId === group.id}
            onClick={() => onSelectGroup(group.id)}
          />
        ))}
      </nav>
    </aside>
  );
}

function GroupButton(props: {
  id: string;
  name: string;
  subtitle: string;
  count: number;
  active: boolean;
  onClick(): void;
}) {
  return (
    <button className={`skills-group ${props.active ? "active" : ""}`} type="button" onClick={props.onClick}>
      <span>
        <strong>{props.name}</strong>
        <small>{props.subtitle}</small>
      </span>
      <b>{props.count}</b>
    </button>
  );
}
