import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultSkillsUserSettings,
  fontFamilyCssValue,
  loadSkillsUserSettings,
  normalizeSkillsUserSettings,
  saveSkillsUserSettings
} from "../src/settings";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Skills Manager settings", () => {
  it("uses the reference-aligned light appearance by default", () => {
    expect(defaultSkillsUserSettings.theme).toBe("light");
    expect(fontFamilyCssValue("system")).toContain("SF Pro Text");
  });

  it("persists both light and dark theme selections", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem(key: string) {
          return values.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          values.set(key, value);
        }
      }
    });

    saveSkillsUserSettings({ ...defaultSkillsUserSettings, theme: "dark" });
    expect(loadSkillsUserSettings().theme).toBe("dark");

    saveSkillsUserSettings({ ...defaultSkillsUserSettings, theme: "light" });
    expect(loadSkillsUserSettings().theme).toBe("light");
  });

  it("falls back safely when stored appearance settings are invalid", () => {
    expect(normalizeSkillsUserSettings({ theme: "neon", compactLists: "yes" })).toMatchObject({
      theme: "light",
      compactLists: false
    });
  });
});
