import { afterEach, describe, expect, it, vi } from "vitest";
import { shouldFocusSearchFromShortcut } from "../src/App";

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
