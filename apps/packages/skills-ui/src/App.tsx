import { useEffect, useMemo, useRef, useState } from "react";
import type { SkillDetail, SkillSummary, SkillsLibrary } from "@skills-manager/core";
import type { ImportRepositoryInput, SkillsAdapter } from "@skills-manager/platform";
import { mockAdapter } from "@skills-manager/platform";
import { GroupSidebar } from "./components/GroupSidebar";
import { InstallPanel } from "./components/InstallPanel";
import { SkillDetailView } from "./components/SkillDetailView";
import { SkillList } from "./components/SkillList";
import { TranslatePanel } from "./components/TranslatePanel";
import { findImportedGroup, firstSkillForView, groupAfterRefresh, selectedSkillForView, skillsForView } from "./selection";

export interface SkillsManagerAppProps {
  adapter?: SkillsAdapter;
  repositorySources?: RepositorySourceOption[];
}

export interface RepositorySourceOption {
  id: NonNullable<ImportRepositoryInput["source"]>;
  label: string;
}

const defaultRepositorySources: RepositorySourceOption[] = [
  { id: "server-cache", label: "Server cache" },
  { id: "github-api", label: "GitHub API" }
];

export function SkillsManagerApp({ adapter = mockAdapter, repositorySources = defaultRepositorySources }: SkillsManagerAppProps) {
  const [library, setLibrary] = useState<SkillsLibrary>({ groups: [], skills: [] });
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [selectedDetail, setSelectedDetail] = useState<SkillDetail | null>(null);
  const [query, setQuery] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [repositorySource, setRepositorySource] = useState<NonNullable<ImportRepositoryInput["source"]>>(repositorySources[0].id);
  const [status, setStatus] = useState("Loading library...");
  const [busyAction, setBusyAction] = useState<"loading" | "importing" | "refreshing" | "removing" | "selecting" | "">("loading");
  const selectionRequestId = useRef(0);

  useEffect(() => {
    setBusyAction("loading");
    adapter
      .listLibrary()
      .then((nextLibrary) => {
        setLibrary(nextLibrary);
        if (!selectedSkillId) {
          const firstSkill = firstSkillForView(nextLibrary, selectedGroupId, query);
          if (firstSkill) {
            void selectSkill(firstSkill, { showBusy: false });
          }
        }
        setStatus("");
      })
      .catch((error: unknown) => setStatus(error instanceof Error ? error.message : String(error)));
  }, [adapter]);

  useEffect(() => {
    if (!repositorySources.some((source) => source.id === repositorySource)) {
      setRepositorySource(repositorySources[0].id);
    }
  }, [repositorySource, repositorySources]);

  useEffect(() => {
    if (!status) {
      setBusyAction("");
    }
  }, [status]);

  const visibleSkills = useMemo(() => {
    return skillsForView(library, selectedGroupId, query);
  }, [library.skills, query, selectedGroupId]);

  const selectedGroup = library.groups.find((group) => group.id === selectedGroupId);
  const canRemoveSelectedGroup = Boolean(selectedGroup && selectedGroup.kind !== "local");

  function clearSelection(): void {
    selectionRequestId.current += 1;
    setSelectedSkillId("");
    setSelectedDetail(null);
  }

  async function selectSkill(skill: SkillSummary, options: { showBusy?: boolean } = {}): Promise<void> {
    const showBusy = options.showBusy ?? true;
    const requestId = selectionRequestId.current + 1;
    selectionRequestId.current = requestId;
    setSelectedSkillId(skill.id);
    setSelectedDetail(null);
    if (showBusy) {
      setBusyAction("selecting");
    }
    try {
      const detail = await adapter.getSkillDetail({ skillId: skill.id });
      if (selectionRequestId.current !== requestId) {
        return;
      }
      setSelectedDetail(detail);
      setStatus("");
    } catch (error) {
      if (selectionRequestId.current !== requestId) {
        return;
      }
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      if (showBusy) {
        setBusyAction((current) => (current === "selecting" ? "" : current));
      }
    }
  }

  async function selectFirstVisibleSkill(nextLibrary: SkillsLibrary, groupId: string, nextQuery: string, showBusy = false): Promise<void> {
    const nextSelection = firstSkillForView(nextLibrary, groupId, nextQuery);
    if (nextSelection) {
      await selectSkill(nextSelection, { showBusy });
    } else {
      clearSelection();
    }
  }

  async function importRepository(): Promise<void> {
    if (!repositoryUrl.trim()) {
      setStatus("Enter a GitHub repository URL.");
      return;
    }
    setBusyAction("importing");
    setStatus("Importing repository...");
    try {
      const nextLibrary = await adapter.importRepository({ url: repositoryUrl, source: repositorySource });
      const importedGroup = findImportedGroup(library, nextLibrary);
      const nextGroupId = importedGroup?.id ?? selectedGroupId;
      setLibrary(nextLibrary);
      setRepositoryUrl("");
      setQuery("");
      setSelectedGroupId(nextGroupId);
      await selectFirstVisibleSkill(nextLibrary, nextGroupId, "", false);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyAction((current) => (current === "importing" ? "" : current));
    }
  }

  async function refreshRepositories(): Promise<void> {
    setBusyAction("refreshing");
    setStatus("Refreshing repositories...");
    try {
      const nextLibrary = await adapter.refreshRepositories();
      const nextGroupId = groupAfterRefresh(nextLibrary, selectedGroupId);
      setLibrary(nextLibrary);
      setSelectedGroupId(nextGroupId);
      const nextSelection = selectedSkillForView(nextLibrary, nextGroupId, query, selectedSkillId);
      await selectResolvedSkill(nextSelection, false);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyAction((current) => (current === "refreshing" ? "" : current));
    }
  }

  async function removeSelectedRepository(): Promise<void> {
    if (!selectedGroup || selectedGroup.kind === "local") {
      return;
    }
    setBusyAction("removing");
    setStatus(`Removing ${selectedGroup.name}...`);
    try {
      const nextLibrary = await adapter.removeRepository({ repositoryId: selectedGroup.id });
      setLibrary(nextLibrary);
      setSelectedGroupId("all");
      await selectFirstVisibleSkill(nextLibrary, "all", query, false);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyAction((current) => (current === "removing" ? "" : current));
    }
  }

  async function selectGroup(groupId: string): Promise<void> {
    setSelectedGroupId(groupId);
    await selectFirstVisibleSkill(library, groupId, query, true);
  }

  async function selectResolvedSkill(skill: SkillSummary | undefined, showBusy = false): Promise<void> {
    if (skill) {
      await selectSkill(skill, { showBusy });
    } else {
      clearSelection();
    }
  }

  async function updateQuery(nextQuery: string): Promise<void> {
    setQuery(nextQuery);
    const nextSelection = selectedSkillForView(library, selectedGroupId, nextQuery, selectedSkillId);
    if (nextSelection?.id === selectedSkillId) {
      return;
    }
    await selectResolvedSkill(nextSelection, true);
  }

  return (
    <main className="skills-shell" aria-busy={busyAction ? "true" : "false"}>
      <GroupSidebar
        groups={library.groups}
        totalSkills={library.skills.length}
        selectedGroupId={selectedGroupId}
        onSelectGroup={(groupId) => void selectGroup(groupId)}
      />
      <section className="skills-list-pane">
        <div className="skills-import-bar">
          <input
            value={repositoryUrl}
            onChange={(event) => setRepositoryUrl(event.target.value)}
            placeholder="https://github.com/owner/repo"
          />
          <select value={repositorySource} onChange={(event) => setRepositorySource(event.target.value as NonNullable<ImportRepositoryInput["source"]>)}>
            {repositorySources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={importRepository} disabled={Boolean(busyAction)}>
            {busyAction === "importing" ? "Importing" : "Import"}
          </button>
          <button type="button" onClick={refreshRepositories} disabled={Boolean(busyAction)}>
            {busyAction === "refreshing" ? "Refreshing" : "Refresh"}
          </button>
          <button type="button" onClick={removeSelectedRepository} disabled={Boolean(busyAction) || !canRemoveSelectedGroup}>
            {busyAction === "removing" ? "Removing" : "Remove"}
          </button>
        </div>
        <div className="skills-toolbar">
          <div>
            <h2>{selectedGroupId === "all" ? "All skills" : library.groups.find((group) => group.id === selectedGroupId)?.name}</h2>
            <p>
              {visibleSkills.length} of {library.skills.length} skills
            </p>
          </div>
          <input value={query} onChange={(event) => void updateQuery(event.target.value)} placeholder="Search skills" />
        </div>
        {status ? <div className="skills-status">{status}</div> : null}
        <SkillList skills={visibleSkills} selectedSkillId={selectedSkillId} onSelectSkill={selectSkill} />
      </section>
      <section className="skills-detail-pane">
        <SkillDetailView detail={selectedDetail} />
        {selectedDetail ? (
          <div className="skills-detail-actions">
            <TranslatePanel adapter={adapter} skillId={selectedDetail.id} />
            <InstallPanel adapter={adapter} skillId={selectedDetail.id} />
          </div>
        ) : null}
      </section>
    </main>
  );
}
