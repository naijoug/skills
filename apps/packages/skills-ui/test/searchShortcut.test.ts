import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  focusSearchFromShortcut,
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

    expect(searchMarkup).not.toContain("Command palette actions");
    expect(commandMarkup).toContain("Command palette actions");
    expect(commandMarkup).toContain("Search skills");
    expect(commandMarkup).toContain("Open repositories");
    expect(commandMarkup).toContain("Select a skill first");
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

const commands: CommandPaletteCommand[] = [
  {
    id: "search-skills",
    title: "Search skills",
    hint: "Focus and select the skill search field."
  },
  {
    id: "open-repositories",
    title: "Open repositories",
    hint: "Show repository import and refresh controls."
  },
  {
    id: "manage-installs",
    title: "Manage installs for selected skill",
    hint: "Open install targets for the selected skill.",
    disabledReason: "Select a skill first"
  }
];
