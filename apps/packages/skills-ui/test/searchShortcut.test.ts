import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchField, shouldFocusSearchFromShortcut } from "../src/App";

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
});

describe("search field copy", () => {
  it("describes shortcut focus without promising a command palette", () => {
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
    expect(markup).toContain("Focus search with the shortcut; command palette actions are not enabled yet.");
  });
});

function shortcut(overrides: Partial<Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey" | "target">>): boolean {
  return shouldFocusSearchFromShortcut({
    key: overrides.key ?? "k",
    metaKey: overrides.metaKey ?? false,
    ctrlKey: overrides.ctrlKey ?? false,
    altKey: overrides.altKey ?? false,
    shiftKey: overrides.shiftKey ?? false,
    target: overrides.target ?? null
  });
}
