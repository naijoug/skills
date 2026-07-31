import type { ReactNode } from "react";
import { Aperture, BookOpen, ChevronDown, Database, GitFork, Monitor, Plus, Settings } from "lucide-react";
import type { SkillGroup } from "@skills-manager/core";

export interface GroupSidebarProps {
  groups: SkillGroup[];
  totalSkills: number;
  selectedGroupId: string;
  activeView: "library" | "settings";
  repositoriesOpen: boolean;
  platformLabel: string;
  capabilityText: string;
  repositoryCount: number;
  onSelectGroup(groupId: string): void;
  onOpenRepositories(): void;
  onOpenSettings(): void;
  onImportRepository(): void;
}

export function GroupSidebar({
  groups,
  totalSkills,
  selectedGroupId,
  activeView,
  repositoriesOpen,
  platformLabel,
  capabilityText,
  repositoryCount,
  onSelectGroup,
  onOpenRepositories,
  onOpenSettings,
  onImportRepository
}: GroupSidebarProps) {
  const localGroups = groups.filter((group) => group.kind === "local");
  const importedGroups = groups.filter((group) => group.kind !== "local");

  return (
    <aside className="skills-sidebar" data-skill-count={totalSkills} data-tauri-drag-region="true">
      <div className="skills-sidebar-brand" data-tauri-drag-region="true">
        <span aria-hidden="true" />
        <strong data-tauri-drag-region="true">Skills Manager</strong>
      </div>

      <div className="skills-sidebar-main">
        <nav className="skills-primary-nav" aria-label="Primary navigation">
          <NavButton
            active={activeView === "library" && selectedGroupId === "all" && !repositoriesOpen}
            icon={<BookOpen size={19} />}
            label="Library"
            onClick={() => onSelectGroup("all")}
          />
          <NavButton
            active={activeView === "library" && repositoriesOpen}
            icon={<Database size={19} />}
            label="Repositories"
            badge={repositoryCount || undefined}
            onClick={onOpenRepositories}
          />
          <NavButton active={activeView === "settings"} icon={<Settings size={19} />} label="Settings" onClick={onOpenSettings} />
        </nav>

        {localGroups.length ? (
          <SidebarGroup label="Workspace repositories">
            {localGroups.map((group) => (
              <RepositoryButton
                active={activeView === "library" && selectedGroupId === group.id}
                group={group}
                icon={<Monitor size={17} />}
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
              />
            ))}
          </SidebarGroup>
        ) : null}

        {importedGroups.length ? (
          <SidebarGroup label="Imported repositories">
            {importedGroups.map((group) => (
              <RepositoryButton
                active={activeView === "library" && selectedGroupId === group.id}
                group={group}
                icon={<GitFork size={16} />}
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
              />
            ))}
          </SidebarGroup>
        ) : null}
      </div>

      <button className="skills-import-repository" type="button" onClick={onImportRepository}>
        <Plus size={18} />
        <span>Import repository</span>
      </button>

      <div className="skills-sidebar-status" title={capabilityText}>
        <Aperture size={16} aria-hidden="true" />
        <span>
          <strong>Skills Manager</strong>
          <small>1.4.2 · {platformLabel}</small>
        </span>
        <ChevronDown size={15} />
      </div>
    </aside>
  );
}

function SidebarGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="skills-sidebar-group">
      <h2>{label}</h2>
      <div>{children}</div>
    </section>
  );
}

function RepositoryButton({
  active,
  group,
  icon,
  onClick
}: {
  active: boolean;
  group: SkillGroup;
  icon: ReactNode;
  onClick(): void;
}) {
  return (
    <button className={`skills-repository-item ${active ? "active" : ""}`} type="button" onClick={onClick}>
      {icon}
      <span>{group.name}</span>
      <i aria-label={`${group.skillCount ?? 0} skills`} />
    </button>
  );
}

function NavButton({
  icon,
  label,
  badge,
  active,
  onClick
}: {
  icon: ReactNode;
  label: string;
  badge?: number;
  active: boolean;
  onClick(): void;
}) {
  return (
    <button className={`skills-nav-item ${active ? "active" : ""}`} type="button" onClick={onClick}>
      {icon}
      <span>{label}</span>
      {typeof badge === "number" ? <b>{badge}</b> : null}
    </button>
  );
}
