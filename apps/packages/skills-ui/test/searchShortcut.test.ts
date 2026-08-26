import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  focusSearchFromShortcut,
  formatGistBundleStatus,
  formatCommandStatus,
  formatSkillPathStatus,
  formatTranslateSummaryStatus,
  handleCommandPaletteSearchKeyDown,
  commandPaletteVisibleRows,
  isCommandPaletteQuery,
  SearchField,
  shouldFocusSearchFromShortcut,
  skillSearchQuery,
  type SearchFocusTarget
} from "../src/App";
import type { CommandPaletteCommand } from "../src/commandPaletteCommands";

describe("search shortcut handling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it("accepts command-k and control-k from non-editable targets", () => {
    expect(shortcut({ key: "k", metaKey: true })).toBe(true);
    expect(shortcut({ key: "K", ctrlKey: true })).toBe(true);
  });

  it("ignores unrelated or modified shortcuts", () => {
    expect(shortcut({ key: "j", metaKey: true })).toBe(false);
    expect(shortcut({ key: "k" })).toBe(false);
    expect(shortcut({ key: "k", ctrlKey: true, altKey: true })).toBe(false);
    expect(shortcut({ key: "k", metaKey: true, shiftKey: true })).toBe(false);
  });

  it("ignores shortcuts while focus is already inside an editable field", () => {
    class FakeHTMLElement {
      isContentEditable = false;
      tagName = "INPUT";
    }
    vi.stubGlobal("HTMLElement", FakeHTMLElement);

    expect(shortcut({ key: "k", metaKey: true, target: new FakeHTMLElement() as unknown as EventTarget })).toBe(false);
  });

  it("focuses and selects search when the shortcut is handled", () => {
    const event = shortcutEvent({ key: "k", metaKey: true });
    const input: SearchFocusTarget = { focus: vi.fn(), select: vi.fn() };
    const setPrimaryView = vi.fn();

    expect(focusSearchFromShortcut(event, { current: input }, setPrimaryView)).toBe(true);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(setPrimaryView).toHaveBeenCalledWith("library");
    expect(input.focus).toHaveBeenCalledTimes(1);
    expect(input.select).toHaveBeenCalledTimes(1);
  });

  it("does not focus search for unrelated shortcuts", () => {
    const event = shortcutEvent({ key: "j", metaKey: true });
    const input: SearchFocusTarget = { focus: vi.fn(), select: vi.fn() };
    const setPrimaryView = vi.fn();

    expect(focusSearchFromShortcut(event, { current: input }, setPrimaryView)).toBe(false);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(setPrimaryView).not.toHaveBeenCalled();
    expect(input.focus).not.toHaveBeenCalled();
    expect(input.select).not.toHaveBeenCalled();
  });
});

describe("search field copy", () => {
  it("describes shortcut focus and the explicit command trigger", () => {
    const markup = renderToStaticMarkup(
      createElement(SearchField, {
        inputRef: { current: null },
        query: "",
        onOpenRepositories: () => undefined,
        onQueryChange: () => undefined
      })
    );

    expect(markup).toContain("placeholder=\"Search skills...\"");
    expect(markup).toContain("aria-describedby=\"skills-search-help\"");
    expect(markup).toContain("Type &gt; to show command actions; press the shortcut to focus search.");
  });

  it("renders command rows only when the query starts with the explicit trigger", () => {
    const baseProps = {
      commands,
      inputRef: { current: null },
      onOpenRepositories: () => undefined,
      onQueryChange: () => undefined
    };

    const searchMarkup = renderToStaticMarkup(createElement(SearchField, { ...baseProps, query: "repo" }));
    const commandMarkup = renderToStaticMarkup(createElement(SearchField, { ...baseProps, query: ">" }));
    const filteredMarkup = renderToStaticMarkup(createElement(SearchField, { ...baseProps, query: ">repo" }));
    const emptyMarkup = renderToStaticMarkup(createElement(SearchField, { ...baseProps, query: ">publish" }));

    expect(searchMarkup).not.toContain("Command palette actions");
    expect(commandMarkup).toContain("Command palette actions");
    expect(commandMarkup).toContain("aria-expanded=\"true\"");
    expect(commandMarkup).toContain("aria-controls=\"skills-command-rows\"");
    expect(commandMarkup).toContain("aria-activedescendant=\"skills-command-search-skills\"");
    expect(commandMarkup).toContain("aria-selected=\"true\"");
    expect(commandMarkup).toContain("Search skills");
    expect(commandMarkup).toContain("Open repositories");
    expect(commandMarkup).toContain("Select a skill first");
    expect(filteredMarkup).toContain("Open repositories");
    expect(filteredMarkup).toContain("Show repository import and refresh controls.");
    expect(filteredMarkup).not.toContain("Focus and select the skill search field.");
    expect(filteredMarkup).not.toContain("Select a skill first");
    expect(emptyMarkup).toContain("No command actions match this query.");
    expect(emptyMarkup).not.toContain("aria-activedescendant");
  });

  it("keeps disabled command rows selectable and shows command-local status", () => {
    const markup = renderToStaticMarkup(
      createElement(SearchField, {
        commands,
        commandStatus: formatCommandStatus("Select a skill first"),
        inputRef: { current: null },
        query: ">install",
        onCommandSelect: () => undefined,
        onOpenRepositories: () => undefined,
        onQueryChange: () => undefined
      })
    );

    expect(markup).toContain("aria-disabled=\"true\"");
    expect(markup).not.toContain("disabled=\"\"");
    expect(markup).toContain("class=\"skills-command-status\" role=\"status\" aria-live=\"polite\"");
    expect(markup).toContain("<small>Select a skill first</small>");
    expect(markup).toContain("Command unavailable: Select a skill first");
  });

  it("formats local command feedback without changing the global status copy", () => {
    expect(formatCommandStatus("Select a skill first")).toBe("Command unavailable: Select a skill first");
    expect(formatCommandStatus("")).toBe("");
  });

  it("formats selected-detail command progress and completion statuses", () => {
    const path = "manual/review/repo-review/SKILL.md";

    expect(formatSkillPathStatus("pending", path)).toBe("Copying path: manual/review/repo-review/SKILL.md");
    expect(formatSkillPathStatus("clipboard", path)).toBe("Copied path: manual/review/repo-review/SKILL.md");
    expect(formatSkillPathStatus("download", path)).toBe("Downloaded path: manual/review/repo-review/SKILL.md");
    expect(formatGistBundleStatus("pending")).toBe("Exporting Gist-ready skill bundle...");
    expect(formatGistBundleStatus("clipboard")).toBe("Copied Gist-ready skill bundle to clipboard.");
    expect(formatGistBundleStatus("download")).toBe("Downloaded Gist-ready skill bundle.");
    expect(formatTranslateSummaryStatus()).toBe("Opened summary translation panel.");
  });

  it("limits empty command mode rows while keeping filtered matches discoverable", () => {
    expect(commandPaletteVisibleRows(extendedCommands, ">").map((command) => command.id)).toEqual([
      "search-skills",
      "open-repositories",
      "manage-installs",
      "copy-skill-path"
    ]);

    expect(commandPaletteVisibleRows(extendedCommands, ">gist").map((command) => command.id)).toEqual(["export-gist-bundle"]);
  });
});

describe("command query handling", () => {
  it("does not pass command-mode queries into skill filtering", () => {
    expect(isCommandPaletteQuery(">repo")).toBe(true);
    expect(isCommandPaletteQuery("  >repo")).toBe(true);
    expect(isCommandPaletteQuery("repo")).toBe(false);
    expect(skillSearchQuery(">repo")).toBe("");
    expect(skillSearchQuery("repo")).toBe("repo");
  });
});

describe("command rows keydown handling", () => {
  it("moves the active command without selecting a row", () => {
    const event = keydownEvent("ArrowDown");
    const state = commandKeyDownState({ activeCommandIndex: 0 });

    expect(handleCommandPaletteSearchKeyDown(event, state)).toBe(true);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(state.clearCommandStatus).toHaveBeenCalledTimes(1);
    expect(state.setActiveCommandIndex).toHaveBeenCalledWith(1);
    expect(state.onCommandSelect).not.toHaveBeenCalled();
    expect(state.onQueryChange).not.toHaveBeenCalled();
  });

  it("selects the active command with Enter, including disabled commands for execution-layer status", () => {
    const event = keydownEvent("Enter");
    const state = commandKeyDownState({ activeCommandIndex: 2 });

    expect(handleCommandPaletteSearchKeyDown(event, state)).toBe(true);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(state.clearCommandStatus).not.toHaveBeenCalled();
    expect(state.onCommandSelect).toHaveBeenCalledWith("manage-installs");
    expect(state.onQueryChange).not.toHaveBeenCalled();
    expect(state.setActiveCommandIndex).not.toHaveBeenCalled();
  });

  it("clears command mode with Escape", () => {
    const event = keydownEvent("Escape");
    const state = commandKeyDownState({ activeCommandIndex: 1 });

    expect(handleCommandPaletteSearchKeyDown(event, state)).toBe(true);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(state.clearCommandStatus).toHaveBeenCalledTimes(1);
    expect(state.setActiveCommandIndex).toHaveBeenCalledWith(0);
    expect(state.onQueryChange).toHaveBeenCalledWith("");
    expect(state.onCommandSelect).not.toHaveBeenCalled();
  });

  it("clears command mode with Escape even when no command rows match", () => {
    const event = keydownEvent("Escape");
    const state = commandKeyDownState({ commandRows: [] });

    expect(handleCommandPaletteSearchKeyDown(event, state)).toBe(true);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(state.clearCommandStatus).toHaveBeenCalledTimes(1);
    expect(state.setActiveCommandIndex).toHaveBeenCalledWith(0);
    expect(state.onQueryChange).toHaveBeenCalledWith("");
    expect(state.onCommandSelect).not.toHaveBeenCalled();
  });

  it("ignores keys outside command mode or unrelated keys", () => {
    const disabledEvent = keydownEvent("Enter");
    const unrelatedEvent = keydownEvent("Tab");
    const disabledState = commandKeyDownState({ enabled: false });
    const unrelatedState = commandKeyDownState();

    expect(handleCommandPaletteSearchKeyDown(disabledEvent, disabledState)).toBe(false);
    expect(handleCommandPaletteSearchKeyDown(unrelatedEvent, unrelatedState)).toBe(false);

    expect(disabledEvent.preventDefault).not.toHaveBeenCalled();
    expect(unrelatedEvent.preventDefault).not.toHaveBeenCalled();
    expect(disabledState.clearCommandStatus).not.toHaveBeenCalled();
    expect(unrelatedState.clearCommandStatus).not.toHaveBeenCalled();
    expect(disabledState.onCommandSelect).not.toHaveBeenCalled();
    expect(unrelatedState.onCommandSelect).not.toHaveBeenCalled();
  });
});

function shortcut(
  overrides: Partial<Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey" | "target">>
): boolean {
  return shouldFocusSearchFromShortcut(shortcutEvent(overrides));
}

function shortcutEvent(
  overrides: Partial<Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey" | "target">>
): Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey" | "target" | "preventDefault"> {
  return {
    key: overrides.key ?? "k",
    metaKey: overrides.metaKey ?? false,
    ctrlKey: overrides.ctrlKey ?? false,
    altKey: overrides.altKey ?? false,
    shiftKey: overrides.shiftKey ?? false,
    target: overrides.target ?? null,
    preventDefault: vi.fn()
  };
}

function keydownEvent(key: string): Pick<KeyboardEvent, "key" | "preventDefault"> {
  return { key, preventDefault: vi.fn() };
}

function commandKeyDownState(overrides: { activeCommandIndex?: number; commandRows?: CommandPaletteCommand[]; enabled?: boolean } = {}) {
  return {
    activeCommandIndex: overrides.activeCommandIndex ?? 0,
    commands: overrides.commandRows ?? commands,
    enabled: overrides.enabled ?? true,
    clearCommandStatus: vi.fn(),
    onCommandSelect: vi.fn(),
    onQueryChange: vi.fn(),
    setActiveCommandIndex: vi.fn()
  };
}

const commands: CommandPaletteCommand[] = [
  {
    id: "search-skills",
    title: "Search skills",
    hint: "Focus and select the skill search field.",
    keywords: ["search", "find", "skill", "skills", "filter"]
  },
  {
    id: "open-repositories",
    title: "Open repositories",
    hint: "Show repository import and refresh controls.",
    keywords: ["repo", "repos", "repository", "repositories", "import", "refresh", "source", "sources"]
  },
  {
    id: "manage-installs",
    title: "Manage installs for selected skill",
    hint: "Open install targets for the selected skill.",
    keywords: ["install", "installs", "target", "targets", "manage", "local", "desktop"],
    disabledReason: "Select a skill first"
  }
];

const extendedCommands: CommandPaletteCommand[] = [
  ...commands,
  {
    id: "copy-skill-path",
    title: "Copy selected skill path",
    hint: "Copy the selected skill relative path; download a text fallback if clipboard is unavailable.",
    keywords: ["copy", "path", "relative", "link", "location", "clipboard", "download"],
    disabledReason: "Select a skill first"
  },
  {
    id: "translate-summary",
    title: "Translate selected skill summary",
    hint: "Open the selected skill summary translation panel.",
    keywords: ["translate", "translation", "language", "summary", "localize", "i18n"],
    disabledReason: "Select a skill first"
  },
  {
    id: "export-gist-bundle",
    title: "Export selected skill Gist bundle",
    hint: "Copy a Gist-ready skill bundle; download a markdown fallback if clipboard is unavailable.",
    keywords: ["export", "gist", "bundle", "share", "markdown", "clipboard", "download"],
    disabledReason: "Select a skill first"
  },
  {
    id: "open-settings",
    title: "Open settings",
    hint: "Open Web Mode preferences.",
    keywords: ["settings", "setting", "preferences", "prefs", "options", "appearance"]
  }
];
