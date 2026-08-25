import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { ChevronDown, Languages, Link2, MoreHorizontal, RefreshCw, Search, Share2, SlidersHorizontal } from "lucide-react";
import type { SkillDetail, SkillSummary, SkillsLibrary } from "@skills-manager/core";
import type { ImportRepositoryInput, SkillsAdapter } from "@skills-manager/platform";
import { mockAdapter } from "@skills-manager/platform";
import { gistBundleForDetail } from "./actionBundles";
import { GroupSidebar } from "./components/GroupSidebar";
import { InstallPanel } from "./components/InstallPanel";
import { SettingsListPane, SettingsPanel, type SettingsSectionId } from "./components/SettingsPanel";
import { SkillDetailView, type SkillDetailTab } from "./components/SkillDetailView";
import { SkillList } from "./components/SkillList";
import { TranslatePanel } from "./components/TranslatePanel";
import {
  commandPaletteKeyboardAction,
  commandPaletteCommands,
  executeCommandPaletteCommand,
  filterCommandPaletteCommands,
  type CommandPaletteCommand,
  type CommandPaletteCommandId
} from "./commandPaletteCommands";
import { findImportedGroup, firstSkillForView, groupAfterRefresh, selectedSkillForView, skillsForView } from "./selection";
import {
  defaultSkillsUserSettings,
  fontFamilyCssValue,
  fontSizeCssValue,
  loadSkillsUserSettings,
  saveSkillsUserSettings,
  type SkillsUserSettings
} from "./settings";

export interface SkillsManagerAppProps {
  adapter?: SkillsAdapter;
  repositorySources?: RepositorySourceOption[];
}

export interface RepositorySourceOption {
  id: NonNullable<ImportRepositoryInput["source"]>;
  label: string;
}

type PrimaryView = "library" | "settings";

const defaultRepositorySources: RepositorySourceOption[] = [
  { id: "server-cache", label: "Git clone cache" },
  { id: "github-api", label: "GitHub API" }
];

export function SkillsManagerApp({ adapter = mockAdapter, repositorySources = defaultRepositorySources }: SkillsManagerAppProps) {
  const [settings, setSettings] = useState<SkillsUserSettings>(() => loadSkillsUserSettings());
  const [primaryView, setPrimaryView] = useState<PrimaryView>(() => initialPrimaryView(settings));
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSectionId>(() => initialSettingsSection());
  const [library, setLibrary] = useState<SkillsLibrary>({ groups: [], skills: [] });
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [selectedDetail, setSelectedDetail] = useState<SkillDetail | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<SkillDetailTab>("summary");
  const [query, setQuery] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [repositorySource, setRepositorySource] = useState<NonNullable<ImportRepositoryInput["source"]>>(repositorySources[0].id);
  const [repositoriesOpen, setRepositoriesOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [status, setStatus] = useState("Loading library...");
  const [commandStatus, setCommandStatus] = useState("");
  const [busyAction, setBusyAction] = useState<"loading" | "importing" | "refreshing" | "removing" | "selecting" | "">("loading");
  const selectionRequestId = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const shellStyle = {
    "--skills-font-family": fontFamilyCssValue(settings.fontFamily),
    "--skills-font-size": fontSizeCssValue(settings.textScale),
    "--skills-row-height": settings.compactLists ? "58px" : "68px",
    "--skills-local-section-height": settings.compactLists ? "348px" : "408px",
    "--skills-group-heading-height": settings.compactLists ? "32px" : "34px"
  } as CSSProperties;

  useEffect(() => {
    saveSkillsUserSettings(settings);
    document.documentElement.dataset.skillsTheme = settings.theme;
  }, [settings]);

  useEffect(() => {
    setBusyAction("loading");
    adapter
      .listLibrary()
      .then((nextLibrary) => {
        setLibrary(nextLibrary);
        if (!selectedSkillId) {
          const firstSkill = preferredInitialSkill(nextLibrary, selectedGroupId, query);
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

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent): void {
      focusSearchFromShortcut(event, searchInputRef, setPrimaryView);
    }

    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  const skillQuery = skillSearchQuery(query);
  const visibleSkills = useMemo(() => {
    return skillsForView(library, selectedGroupId, skillQuery);
  }, [library.skills, selectedGroupId, skillQuery]);

  const selectedGroup = library.groups.find((group) => group.id === selectedGroupId);
  const selectedDetailGroup = library.groups.find((group) => group.id === selectedDetail?.groupId);
  const selectedRepository =
    selectedGroup && selectedGroup.kind !== "local" ? selectedGroup : selectedDetailGroup && selectedDetailGroup.kind !== "local" ? selectedDetailGroup : undefined;
  const canRemoveSelectedGroup = Boolean(selectedRepository);
  const isDesktopRuntime = repositorySources.some((source) => source.id === "desktop-local");
  const platformLabel = isDesktopRuntime ? "Desktop Mode" : "Web Mode";
  const capabilityText = platformLabel === "Desktop Mode" ? "Ready for local installs" : "Local installs require Desktop";
  const importedRepositoryCount = library.groups.filter((group) => group.kind !== "local").length;
  const commandRows = commandPaletteCommands({ selectedDetail, runtime: isDesktopRuntime ? "desktop" : "web" });

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
    setActiveDetailTab("summary");
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
      setStatus("Enter a GitHub or GitLab repository URL.");
      return;
    }
    setBusyAction("importing");
    setStatus("Importing repository...");
    try {
      const nextLibrary = await adapter.importRepository({ url: repositoryUrl, source: repositorySource });
      const importedGroup = findImportedGroup(library, nextLibrary);
      const importedSkill = importedGroup ? nextLibrary.skills.find((skill) => skill.groupId === importedGroup.id) : undefined;
      setLibrary(nextLibrary);
      setRepositoryUrl("");
      setQuery("");
      setSelectedGroupId("all");
      await selectResolvedSkill(importedSkill ?? firstSkillForView(nextLibrary, "all", ""), false);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyAction((current) => (current === "importing" ? "" : current));
    }
  }

  async function refreshRepositories(): Promise<void> {
    if (!importedRepositoryCount) {
      setStatus("No imported repositories to refresh.");
      return;
    }
    setBusyAction("refreshing");
    setStatus("Refreshing repositories...");
    try {
      const nextLibrary = await adapter.refreshRepositories();
      const nextGroupId = groupAfterRefresh(nextLibrary, selectedGroupId);
      setLibrary(nextLibrary);
      setSelectedGroupId(nextGroupId);
      const nextSelection = selectedSkillForView(nextLibrary, nextGroupId, skillQuery, selectedSkillId);
      await selectResolvedSkill(nextSelection, false);
      setStatus("Repositories refreshed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyAction((current) => (current === "refreshing" ? "" : current));
    }
  }

  async function removeSelectedRepository(): Promise<void> {
    if (!selectedRepository) {
      return;
    }
    setBusyAction("removing");
    setStatus(`Removing ${selectedRepository.name}...`);
    try {
      const nextLibrary = await adapter.removeRepository({ repositoryId: selectedRepository.id });
      setLibrary(nextLibrary);
      setSelectedGroupId("all");
      await selectFirstVisibleSkill(nextLibrary, "all", skillQuery, false);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyAction((current) => (current === "removing" ? "" : current));
    }
  }

  async function selectGroup(groupId: string): Promise<void> {
    setPrimaryView("library");
    setRepositoriesOpen(false);
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
    setCommandStatus("");
    const nextSelection = selectedSkillForView(library, selectedGroupId, skillSearchQuery(nextQuery), selectedSkillId);
    if (nextSelection?.id === selectedSkillId) {
      return;
    }
    await selectResolvedSkill(nextSelection, true);
  }

  function updateSettings(nextSettings: Partial<SkillsUserSettings>): void {
    setSettings((current) => ({ ...current, ...nextSettings }));
  }

  function resetSettings(): void {
    setSettings(defaultSkillsUserSettings);
  }

  function openRepositories(): void {
    setPrimaryView("library");
    setRepositoriesOpen((open) => !open);
    setMoreMenuOpen(false);
  }

  function openSettings(): void {
    setPrimaryView("settings");
    setRepositoriesOpen(false);
    setMoreMenuOpen(false);
  }

  function runCommandPaletteCommand(commandId: CommandPaletteCommandId): void {
    const command = commandRows.find((item) => item.id === commandId);
    if (!command) {
      return;
    }
    executeCommandPaletteCommand(command, {
      clearStatus: () => {
        setStatus("");
        setCommandStatus("");
      },
      clearQuery: () => setQuery(""),
      closeMenus: () => setMoreMenuOpen(false),
      focusSearch: () => {
        setPrimaryView("library");
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      },
      openRepositories: () => {
        setPrimaryView("library");
        setRepositoriesOpen(true);
      },
      manageInstalls: () => {
        setPrimaryView("library");
        setActiveDetailTab("install");
      },
      openSettings,
      setStatus: (message) => {
        setStatus(message);
        setCommandStatus(message);
      }
    });
  }

  function showDetailTab(tab: SkillDetailTab): void {
    setPrimaryView("library");
    setActiveDetailTab(tab);
    setMoreMenuOpen(false);
  }

  function copySelectedSkillPath(): void {
    if (!selectedDetail) {
      return;
    }
    void writeTextOrDownload(selectedDetail.relativePath, `${selectedDetail.name || "skill"}-path.txt`).then((method) => {
      setStatus(method === "clipboard" ? `Copied path: ${selectedDetail.relativePath}` : `Downloaded path: ${selectedDetail.relativePath}`);
    });
    setMoreMenuOpen(false);
  }

  async function exportGistBundle(): Promise<void> {
    if (!selectedDetail) {
      return;
    }
    const bundle = gistBundleForDetail(selectedDetail);
    const method = await writeTextOrDownload(bundle, `${selectedDetail.name || "skill"}-gist.md`);
    setStatus(method === "clipboard" ? "Copied Gist-ready skill bundle to clipboard." : "Downloaded Gist-ready skill bundle.");
    setMoreMenuOpen(false);
  }

  return (
    <main
      className="skills-shell"
      data-theme={settings.theme}
      data-runtime={isDesktopRuntime ? "desktop" : "web"}
      aria-busy={busyAction ? "true" : "false"}
      style={shellStyle}
    >
      <GroupSidebar
        groups={library.groups}
        totalSkills={library.skills.length}
        selectedGroupId={selectedGroupId}
        activeView={primaryView}
        repositoriesOpen={repositoriesOpen}
        platformLabel={platformLabel}
        capabilityText={capabilityText}
        repositoryCount={importedRepositoryCount}
        onSelectGroup={(groupId) => void selectGroup(groupId)}
        onOpenRepositories={openRepositories}
        onOpenSettings={openSettings}
        onImportRepository={() => {
          setPrimaryView("library");
          setRepositoriesOpen(true);
        }}
      />
      <section className="skills-list-pane">
        {primaryView === "settings" ? (
          <SettingsListPane activeSection={activeSettingsSection} onActiveSectionChange={setActiveSettingsSection} />
        ) : (
          <>
            <header className="skills-library-header">
              <div>
                <p>Skill library</p>
                <h1>Your skills</h1>
              </div>
              <span>{library.skills.length} total</span>
            </header>
            <SearchField
              commands={commandRows}
              commandStatus={commandStatus}
              inputRef={searchInputRef}
              query={query}
              onCommandSelect={runCommandPaletteCommand}
              onCommandStatusClear={() => setCommandStatus("")}
              onOpenRepositories={openRepositories}
              onQueryChange={(nextQuery) => void updateQuery(nextQuery)}
            />
            <div className="skills-list-meta">
              <span>{visibleSkills.length} skills</span>
              <button
                type="button"
                aria-label={`Sort skills by name ${sortDirection === "asc" ? "descending" : "ascending"}`}
                onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
              >
                <strong>Name</strong>
                <ChevronDown size={14} />
              </button>
            </div>
            {repositoriesOpen ? (
              <div className="skills-import-bar">
                <input
                  value={repositoryUrl}
                  onChange={(event) => setRepositoryUrl(event.target.value)}
                  placeholder="https://github.com/owner/repo or https://gitlab.com/group/repo"
                />
                <select
                  value={repositorySource}
                  onChange={(event) => setRepositorySource(event.target.value as NonNullable<ImportRepositoryInput["source"]>)}
                >
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
            ) : null}
            {status ? (
              <div className="skills-status" role="status" aria-live="polite">
                {status}
              </div>
            ) : null}
            <SkillList
              skills={visibleSkills}
              selectedSkillId={selectedSkillId}
              sortDirection={sortDirection}
              query={skillQuery}
              groupName={selectedGroup?.name ?? "All skills"}
              onSelectSkill={selectSkill}
              onClearSearch={() => void updateQuery("")}
              onViewAllSkills={() => void selectGroup("all")}
            />
          </>
        )}
      </section>
      <section className="skills-detail-pane">
        {primaryView === "settings" ? (
          <SettingsPanel
            adapter={adapter}
            activeSection={activeSettingsSection}
            platformLabel={platformLabel}
            settings={settings}
            onSettingsChange={updateSettings}
            onReset={resetSettings}
          />
        ) : (
          <SkillDetailView
            detail={selectedDetail}
            activeTab={activeDetailTab}
            platformLabel={platformLabel}
            capabilityText={capabilityText}
            updatedAt={selectedDetailGroup?.updatedAt}
            onActiveTabChange={setActiveDetailTab}
            detailActions={
              <div className="skills-detail-actions">
                <button
                  className="skills-primary-action"
                  type="button"
                  disabled={!selectedDetail}
                  onClick={() => setActiveDetailTab("install")}
                  aria-label="Manage installs for selected skill"
                >
                  <span>Manage installs</span>
                </button>
                <div className="skills-more-wrap">
                  <button
                    className="skills-icon-action"
                    type="button"
                    disabled={!selectedDetail}
                    onClick={() => setMoreMenuOpen((open) => !open)}
                    aria-expanded={moreMenuOpen}
                    aria-label="More skill actions"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {moreMenuOpen && selectedDetail ? (
                    <div className="skills-more-menu" role="menu">
                      <button type="button" role="menuitem" onClick={() => showDetailTab("summary")}>
                        Overview
                      </button>
                      <button type="button" role="menuitem" onClick={() => showDetailTab("markdown")}>
                        Markdown
                      </button>
                      <button type="button" role="menuitem" onClick={() => showDetailTab("files")}>
                        Files
                      </button>
                      <button type="button" role="menuitem" onClick={copySelectedSkillPath}>
                        <Link2 size={15} /> Copy skill path
                      </button>
                      <button type="button" role="menuitem" onClick={() => showDetailTab("summary")}>
                        <Languages size={15} /> Translate
                      </button>
                      <button type="button" role="menuitem" onClick={() => void exportGistBundle()}>
                        <Share2 size={15} /> Export Gist bundle
                      </button>
                      <button type="button" role="menuitem" disabled={Boolean(busyAction)} onClick={() => void refreshRepositories()}>
                        <RefreshCw size={15} /> {busyAction === "refreshing" ? "Refreshing" : "Refresh repositories"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            }
            installPanel={
              selectedDetail ? (
                <InstallPanel adapter={adapter} skillId={selectedDetail.id} confirmActions={settings.confirmInstallActions} />
              ) : null
            }
            summaryTranslationPanel={selectedDetail ? <TranslatePanel adapter={adapter} detail={selectedDetail} sourceMode="summary" /> : null}
            markdownTranslationPanel={selectedDetail ? <TranslatePanel adapter={adapter} detail={selectedDetail} sourceMode="markdown" /> : null}
          />
        )}
      </section>
    </main>
  );
}

interface SearchFieldProps {
  commands?: CommandPaletteCommand[];
  commandStatus?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  onCommandSelect?(commandId: CommandPaletteCommandId): void;
  onCommandStatusClear?(): void;
  onQueryChange(query: string): void;
  onOpenRepositories(): void;
}

export function SearchField({
  commands = [],
  commandStatus = "",
  inputRef,
  query,
  onCommandSelect,
  onCommandStatusClear,
  onOpenRepositories,
  onQueryChange
}: SearchFieldProps) {
  const showCommandRows = isCommandPaletteQuery(query);
  const visibleCommands = filterCommandPaletteCommands(commands, query);
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);

  useEffect(() => {
    setActiveCommandIndex(0);
  }, [query, visibleCommands.length]);

  function handleSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>): void {
    handleCommandPaletteSearchKeyDown(event, {
      activeCommandIndex,
      commands: visibleCommands,
      enabled: showCommandRows,
      clearCommandStatus: onCommandStatusClear,
      onCommandSelect,
      onQueryChange,
      setActiveCommandIndex
    });
  }

  return (
    <div className="skills-search-row">
      <div className="skills-search-stack">
        <div className="skills-search-box">
          <Search className="skills-search-icon" size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search skills..."
            aria-label="Search skills"
            aria-describedby="skills-search-help"
            aria-expanded={showCommandRows}
            aria-controls={showCommandRows ? "skills-command-rows" : undefined}
            aria-activedescendant={showCommandRows ? commandOptionId(visibleCommands[activeCommandIndex]?.id) : undefined}
          />
          <span className="skills-search-kbd" aria-hidden="true">
            <kbd>⌘K</kbd>
            <kbd>Ctrl K</kbd>
          </span>
        </div>
        <p className="skills-search-help" id="skills-search-help">
          Type &gt; to show command actions; press the shortcut to focus search.
        </p>
        {showCommandRows ? (
          <CommandPaletteRows commands={visibleCommands} activeIndex={activeCommandIndex} status={commandStatus} onCommandSelect={onCommandSelect} />
        ) : null}
      </div>
      <button className="skills-filter-action" type="button" aria-label="Open repository filters" onClick={onOpenRepositories}>
        <SlidersHorizontal size={19} />
      </button>
    </div>
  );
}

interface CommandPaletteRowsProps {
  activeIndex?: number;
  commands: CommandPaletteCommand[];
  status?: string;
  onCommandSelect?: (commandId: CommandPaletteCommandId) => void;
}

export function CommandPaletteRows({ activeIndex = 0, commands, status = "", onCommandSelect }: CommandPaletteRowsProps) {
  return (
    <div className="skills-command-rows" id="skills-command-rows" role="listbox" aria-label="Command palette actions">
      {commands.length === 0 ? (
        <div className="skills-command-empty" role="status">
          No command actions match this query.
        </div>
      ) : null}
      {commands.map((command, index) => (
        <button
          key={command.id}
          id={commandOptionId(command.id)}
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          aria-disabled={Boolean(command.disabledReason)}
          onClick={() => onCommandSelect?.(command.id)}
        >
          <span>
            <strong>{command.title}</strong>
            <small>{command.disabledReason ?? command.hint}</small>
          </span>
          <kbd>&gt;</kbd>
        </button>
      ))}
      {status ? (
        <div className="skills-command-status" role="status" aria-live="polite">
          {status}
        </div>
      ) : null}
    </div>
  );
}

export function isCommandPaletteQuery(query: string): boolean {
  return query.trimStart().startsWith(">");
}

export interface CommandPaletteSearchKeyDownState {
  activeCommandIndex: number;
  commands: CommandPaletteCommand[];
  enabled: boolean;
  clearCommandStatus?(): void;
  onCommandSelect?: (commandId: CommandPaletteCommandId) => void;
  onQueryChange(query: string): void;
  setActiveCommandIndex(index: number): void;
}

export function handleCommandPaletteSearchKeyDown(
  event: Pick<KeyboardEvent, "key" | "preventDefault">,
  state: CommandPaletteSearchKeyDownState
): boolean {
  if (!state.enabled) {
    return false;
  }
  const action = commandPaletteKeyboardAction(event, state.commands, state.activeCommandIndex);
  if (!action.handled) {
    return false;
  }

  event.preventDefault();
  if (action.nextActiveIndex !== undefined || action.clearQuery) {
    state.clearCommandStatus?.();
  }
  if (action.nextActiveIndex !== undefined) {
    state.setActiveCommandIndex(action.nextActiveIndex);
  }
  if (action.clearQuery) {
    state.onQueryChange("");
  }
  if (action.selectCommandId) {
    state.onCommandSelect?.(action.selectCommandId);
  }
  return true;
}

function commandOptionId(commandId: CommandPaletteCommandId | undefined): string | undefined {
  return commandId ? `skills-command-${commandId}` : undefined;
}

export function skillSearchQuery(query: string): string {
  return isCommandPaletteQuery(query) ? "" : query;
}

function preferredInitialSkill(library: SkillsLibrary, groupId: string, query: string): SkillSummary | undefined {
  return skillsForView(library, groupId, query).find((skill) => skill.name === "type-safety") ?? firstSkillForView(library, groupId, query);
}

function initialPrimaryView(settings: SkillsUserSettings): PrimaryView {
  if (typeof window !== "undefined" && window.location.hash.startsWith("#settings")) {
    return "settings";
  }
  return settings.startupView;
}

function initialSettingsSection(): SettingsSectionId {
  if (typeof window === "undefined") {
    return "appearance";
  }
  const section = window.location.hash.replace(/^#settings\/?/, "");
  return section === "browser" || section === "translation" || section === "desktop" || section === "appearance" ? section : "appearance";
}

export function shouldFocusSearchFromShortcut(event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey" | "target">): boolean {
  if (event.key.toLowerCase() !== "k" || event.altKey || event.shiftKey || (!event.metaKey && !event.ctrlKey)) {
    return false;
  }
  if (isEditableShortcutTarget(event.target)) {
    return false;
  }
  return true;
}

export interface SearchFocusTarget {
  focus(): void;
  select(): void;
}

export function focusSearchFromShortcut(
  event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey" | "target" | "preventDefault">,
  inputRef: RefObject<SearchFocusTarget | null>,
  setPrimaryView: (view: PrimaryView) => void
): boolean {
  if (!shouldFocusSearchFromShortcut(event)) {
    return false;
  }
  event.preventDefault();
  setPrimaryView("library");
  inputRef.current?.focus();
  inputRef.current?.select();
  return true;
}

function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (typeof HTMLElement === "undefined") {
    return false;
  }
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

async function writeTextOrDownload(text: string, fileName: string): Promise<"clipboard" | "download"> {
  try {
    await navigator.clipboard?.writeText(text);
    if (navigator.clipboard) {
      return "clipboard";
    }
  } catch {
    // Fall through to a local download when clipboard access is unavailable.
  }
  downloadTextFile(fileName, text);
  return "download";
}

function downloadTextFile(fileName: string, text: string): void {
  if (typeof document === "undefined") {
    return;
  }
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
