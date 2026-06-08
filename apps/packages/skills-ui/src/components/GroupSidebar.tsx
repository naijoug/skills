import type { ReactNode } from "react";
import { BookOpen, ChevronRight, Circle, Database, Settings } from "lucide-react";
import type { SkillGroup } from "@skills-manager/core";

export interface GroupSidebarProps {
  groups: SkillGroup[];
  totalSkills: number;
  activeView: "library" | "settings";
  repositoriesOpen: boolean;
  platformLabel: string;
  capabilityText: string;
  repositoryCount: number;
  onSelectGroup(groupId: string): void;
  onOpenRepositories(): void;
  onOpenSettings(): void;
}

export function GroupSidebar({
  groups,
  totalSkills,
  activeView,
  repositoriesOpen,
  platformLabel,
  capabilityText,
  repositoryCount,
  onSelectGroup,
  onOpenRepositories,
  onOpenSettings
}: GroupSidebarProps) {
  return (
    <aside className="skills-sidebar">
      <div className="skills-sidebar-main">
        <nav className="skills-primary-nav" aria-label="Primary navigation">
          <NavButton
            active={activeView === "library" && !repositoriesOpen}
            icon={<BookOpen size={20} />}
            label="Library"
            onClick={() => onSelectGroup("all")}
          />
          <NavButton
            active={activeView === "library" && repositoriesOpen}
            icon={<Database size={20} />}
            label="Repositories"
            badge={repositoryCount || groups.length || totalSkills}
            onClick={onOpenRepositories}
          />
          <NavButton active={activeView === "settings"} icon={<Settings size={20} />} label="Settings" onClick={onOpenSettings} />
        </nav>
      </div>
      <div className="skills-sidebar-status">
        <div>
          <Circle className="skills-status-dot" size={10} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          <strong>{platformLabel}</strong>
          <ChevronRight size={16} />
        </div>
        <span>{capabilityText}</span>
        <hr />
        <small>Codex, Claude Code, Amp</small>
        <small>Skills Manager 1.4.2</small>
      </div>
    </aside>
  );
}

function NavButton(props: {
  icon: ReactNode;
  label: string;
  badge?: number;
  active: boolean;
  onClick(): void;
}) {
  return (
    <button className={`skills-nav-item ${props.active ? "active" : ""}`} type="button" onClick={props.onClick}>
      {props.icon}
      <span>{props.label}</span>
      {typeof props.badge === "number" ? <b>{props.badge}</b> : null}
    </button>
  );
}
