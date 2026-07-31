export type SkillsTheme = "dark" | "light";
export type SkillsFontFamily = "system" | "inter" | "sf-pro" | "mono" | "serif";
export type SkillsTextScale = "compact" | "standard" | "comfortable";
export type ExternalLinkBehavior = "system" | "in-app" | "ask" | "chrome" | "safari";
export type StartupView = "library" | "settings";

export interface SkillsUserSettings {
  theme: SkillsTheme;
  fontFamily: SkillsFontFamily;
  textScale: SkillsTextScale;
  compactLists: boolean;
  externalLinks: ExternalLinkBehavior;
  confirmExternalLinks: boolean;
  startupView: StartupView;
  autoRefreshRepositories: boolean;
  confirmInstallActions: boolean;
  startMinimized: boolean;
}

export const defaultSkillsUserSettings: SkillsUserSettings = {
  theme: "light",
  fontFamily: "system",
  textScale: "standard",
  compactLists: false,
  externalLinks: "system",
  confirmExternalLinks: true,
  startupView: "library",
  autoRefreshRepositories: false,
  confirmInstallActions: true,
  startMinimized: false
};

const settingsStorageKey = "skills-manager:user-settings:v1";

export function loadSkillsUserSettings(): SkillsUserSettings {
  if (typeof window === "undefined") {
    return defaultSkillsUserSettings;
  }
  try {
    const rawSettings = window.localStorage.getItem(settingsStorageKey);
    if (!rawSettings) {
      return defaultSkillsUserSettings;
    }
    return normalizeSkillsUserSettings(JSON.parse(rawSettings));
  } catch {
    return defaultSkillsUserSettings;
  }
}

export function saveSkillsUserSettings(settings: SkillsUserSettings): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
  } catch {
    // Local storage is best-effort; keep the in-memory settings usable.
  }
}

export function fontFamilyCssValue(fontFamily: SkillsFontFamily): string {
  switch (fontFamily) {
    case "inter":
      return 'Inter, "SF Pro Text", ui-sans-serif, system-ui, sans-serif';
    case "sf-pro":
      return '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
    case "mono":
      return '"SF Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    case "serif":
      return 'Georgia, "Times New Roman", serif';
    case "system":
    default:
      return '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
  }
}

export function fontSizeCssValue(textScale: SkillsTextScale): string {
  switch (textScale) {
    case "compact":
      return "12px";
    case "comfortable":
      return "14px";
    case "standard":
    default:
      return "13px";
  }
}

export function normalizeSkillsUserSettings(value: unknown): SkillsUserSettings {
  if (!value || typeof value !== "object") {
    return defaultSkillsUserSettings;
  }
  const record = value as Partial<SkillsUserSettings>;
  return {
    theme: oneOf(record.theme, ["dark", "light"], defaultSkillsUserSettings.theme),
    fontFamily: oneOf(record.fontFamily, ["system", "inter", "sf-pro", "mono", "serif"], defaultSkillsUserSettings.fontFamily),
    textScale: oneOf(record.textScale, ["compact", "standard", "comfortable"], defaultSkillsUserSettings.textScale),
    compactLists: typeof record.compactLists === "boolean" ? record.compactLists : defaultSkillsUserSettings.compactLists,
    externalLinks: oneOf(record.externalLinks, ["system", "in-app", "ask", "chrome", "safari"], defaultSkillsUserSettings.externalLinks),
    confirmExternalLinks:
      typeof record.confirmExternalLinks === "boolean" ? record.confirmExternalLinks : defaultSkillsUserSettings.confirmExternalLinks,
    startupView: oneOf(record.startupView, ["library", "settings"], defaultSkillsUserSettings.startupView),
    autoRefreshRepositories:
      typeof record.autoRefreshRepositories === "boolean"
        ? record.autoRefreshRepositories
        : defaultSkillsUserSettings.autoRefreshRepositories,
    confirmInstallActions:
      typeof record.confirmInstallActions === "boolean" ? record.confirmInstallActions : defaultSkillsUserSettings.confirmInstallActions,
    startMinimized: typeof record.startMinimized === "boolean" ? record.startMinimized : defaultSkillsUserSettings.startMinimized
  };
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}
