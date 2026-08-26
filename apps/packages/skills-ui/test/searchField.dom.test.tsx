/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, createElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SearchField } from "../src/App";
import type { CommandPaletteCommand } from "../src/commandPaletteCommands";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let host: HTMLDivElement | undefined;

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
  }
  host?.remove();
  root = undefined;
  host = undefined;
  vi.restoreAllMocks();
});

describe("SearchField command rows DOM interactions", () => {
  it("clicks a disabled command row instead of suppressing execution-layer feedback", () => {
    const onCommandSelect = vi.fn();
    const view = renderSearchField({ initialQuery: ">install", onCommandSelect });

    act(() => {
      view.option("Manage installs for selected skill").click();
    });

    expect(onCommandSelect).toHaveBeenCalledWith("manage-installs");
  });

  it("selects the active command with ArrowDown then Enter", () => {
    const onCommandSelect = vi.fn();
    const view = renderSearchField({ initialQuery: ">", onCommandSelect });
    const input = view.searchInput();

    act(() => {
      input.dispatchEvent(keydown("ArrowDown"));
    });
    act(() => {
      input.dispatchEvent(keydown("Enter"));
    });

    expect(onCommandSelect).toHaveBeenCalledWith("open-repositories");
  });

  it("clears command mode with Escape and removes command rows from the DOM", () => {
    const view = renderSearchField({ initialQuery: ">repo" });
    const input = view.searchInput();

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(view.host.querySelector("#skills-command-rows")).not.toBeNull();

    act(() => {
      input.dispatchEvent(keydown("Escape"));
    });

    expect(input.value).toBe("");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(view.host.querySelector("#skills-command-rows")).toBeNull();
  });
});

function renderSearchField(options: { initialQuery: string; onCommandSelect?: (commandId: string) => void }) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);

  function Harness() {
    const [query, setQuery] = useState(options.initialQuery);
    return createElement(SearchField, {
      commands,
      inputRef: { current: null },
      query,
      onCommandSelect: options.onCommandSelect,
      onOpenRepositories: () => undefined,
      onQueryChange: setQuery
    });
  }

  act(() => {
    root?.render(createElement(Harness));
  });

  return {
    host,
    searchInput() {
      const input = host?.querySelector<HTMLInputElement>('input[aria-label="Search skills"]');
      if (!input) {
        throw new Error("Search input not found");
      }
      return input;
    },
    option(name: string) {
      const rows = Array.from(host?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
      const row = rows.find((candidate) => candidate.textContent?.includes(name));
      if (!row) {
        throw new Error(`Command option not found: ${name}`);
      }
      return row;
    }
  };
}

function keydown(key: string): KeyboardEvent {
  return new KeyboardEvent("keydown", { key, bubbles: true });
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
