import { AppWindow, Globe2, Monitor, Moon, Palette, RotateCcw, ShieldCheck, Sun, Type as TypeIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { TranslationProviderDescriptor } from "@skills-manager/core";
import type { SkillsAdapter } from "@skills-manager/platform";
import type {
  ExternalLinkBehavior,
  SkillsFontFamily,
  SkillsTextScale,
  SkillsTheme,
  SkillsUserSettings,
  StartupView
} from "../settings";

export type SettingsSectionId = "appearance" | "browser" | "translation" | "desktop";

export interface SettingsPanelProps {
  adapter: SkillsAdapter;
  activeSection: SettingsSectionId;
  platformLabel: string;
  settings: SkillsUserSettings;
  onSettingsChange(settings: Partial<SkillsUserSettings>): void;
  onReset(): void;
}

export const settingsSections: Array<{
  id: SettingsSectionId;
  label: string;
  description: string;
  icon: typeof Palette;
}> = [
  { id: "appearance", label: "Appearance", description: "Theme, font, and density", icon: Palette },
  { id: "browser", label: "Browser & Links", description: "External links and web previews", icon: Globe2 },
  { id: "translation", label: "Translation", description: "Providers, API keys, and local agents", icon: Globe2 },
  { id: "desktop", label: "Desktop", description: "Startup, refresh, and install safety", icon: AppWindow }
];

export function SettingsListPane({
  activeSection,
  onActiveSectionChange
}: {
  activeSection: SettingsSectionId;
  onActiveSectionChange(section: SettingsSectionId): void;
}) {
  return (
    <div className="skills-settings-list">
      <div className="skills-settings-list-header">
        <span>Settings</span>
        <strong>Preferences</strong>
      </div>
      <div className="skills-settings-section-list" role="list">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              className={`skills-settings-section-button ${activeSection === section.id ? "active" : ""}`}
              key={section.id}
              type="button"
              onClick={() => onActiveSectionChange(section.id)}
            >
              <Icon size={17} />
              <span>
                <strong>{section.label}</strong>
                <small>{section.description}</small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SettingsPanel({ adapter, activeSection, platformLabel, settings, onSettingsChange, onReset }: SettingsPanelProps) {
  const section = settingsSections.find((item) => item.id === activeSection) ?? settingsSections[0];
  const Icon = section.icon;

  return (
    <article className="skills-detail skills-settings-page">
      <header className="skills-detail-header">
        <div className="skills-detail-title-row">
          <div>
            <div className="skills-detail-name">
              <h2>Settings</h2>
              <span>{platformLabel}</span>
            </div>
            <p>Preferences save automatically on this device.</p>
          </div>
          <div className="skills-capability-card">
            <Monitor size={22} />
            <div>
              <strong>Local preferences</strong>
              <span>
                <ShieldCheck size={13} />
                Stored in this app
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="skills-tab-panel">
        <section className="skills-settings-section">
          <div className="skills-settings-section-title">
            <Icon size={20} />
            <div>
              <h3>{section.label}</h3>
              <p>{section.description}</p>
            </div>
          </div>

          {activeSection === "appearance" ? (
            <AppearanceSettings settings={settings} onSettingsChange={onSettingsChange} />
          ) : null}
          {activeSection === "browser" ? <BrowserSettings settings={settings} onSettingsChange={onSettingsChange} /> : null}
          {activeSection === "translation" ? <TranslationSettings adapter={adapter} /> : null}
          {activeSection === "desktop" ? <DesktopSettings settings={settings} onSettingsChange={onSettingsChange} /> : null}

          <div className="skills-settings-footer">
            <button type="button" onClick={onReset}>
              <RotateCcw size={15} />
              Reset preferences
            </button>
          </div>
        </section>
      </div>
    </article>
  );
}

function AppearanceSettings({
  settings,
  onSettingsChange
}: {
  settings: SkillsUserSettings;
  onSettingsChange(settings: Partial<SkillsUserSettings>): void;
}) {
  return (
    <div className="skills-setting-stack">
      <fieldset className="skills-theme-setting">
        <legend>Color mode</legend>
        <p>Choose the appearance used across Skills Manager.</p>
        <div className="skills-theme-options">
          <ThemeChoice
            active={settings.theme === "light"}
            description="Bright, calm surfaces for daytime work."
            icon={<Sun size={20} />}
            label="Light"
            onClick={() => onSettingsChange({ theme: "light" as SkillsTheme })}
          />
          <ThemeChoice
            active={settings.theme === "dark"}
            description="Low-glare surfaces for focused work."
            icon={<Moon size={20} />}
            label="Dark"
            onClick={() => onSettingsChange({ theme: "dark" as SkillsTheme })}
          />
        </div>
      </fieldset>
      <div className="skills-setting-grid">
      <SettingSelect
        icon={<TypeIcon size={17} />}
        label="Interface font"
        value={settings.fontFamily}
        onChange={(value) => onSettingsChange({ fontFamily: value as SkillsFontFamily })}
        options={[
          ["system", "System"],
          ["inter", "Inter"],
          ["sf-pro", "SF Pro"],
          ["mono", "Monospace"],
          ["serif", "Serif"]
        ]}
      />
      <SettingSelect
        icon={<TypeIcon size={17} />}
        label="Text size"
        value={settings.textScale}
        onChange={(value) => onSettingsChange({ textScale: value as SkillsTextScale })}
        options={[
          ["compact", "Compact"],
          ["standard", "Standard"],
          ["comfortable", "Comfortable"]
        ]}
      />
      <SettingToggle
        label="Compact skill rows"
        description="Use shorter rows in the skill list."
        checked={settings.compactLists}
        onChange={(compactLists) => onSettingsChange({ compactLists })}
      />
      </div>
    </div>
  );
}

function ThemeChoice({
  active,
  description,
  icon,
  label,
  onClick
}: {
  active: boolean;
  description: string;
  icon: ReactNode;
  label: string;
  onClick(): void;
}) {
  return (
    <button className={`skills-theme-choice ${active ? "active" : ""}`} type="button" aria-pressed={active} onClick={onClick}>
      <span>{icon}</span>
      <strong>{label}</strong>
      <small>{description}</small>
    </button>
  );
}

function BrowserSettings({
  settings,
  onSettingsChange
}: {
  settings: SkillsUserSettings;
  onSettingsChange(settings: Partial<SkillsUserSettings>): void;
}) {
  return (
    <div className="skills-setting-grid">
      <SettingSelect
        icon={<Globe2 size={17} />}
        label="Open external links"
        value={settings.externalLinks}
        onChange={(value) => onSettingsChange({ externalLinks: value as ExternalLinkBehavior })}
        options={[
          ["system", "System browser"],
          ["in-app", "In-app preview"],
          ["ask", "Ask every time"],
          ["chrome", "Google Chrome"],
          ["safari", "Safari"]
        ]}
      />
      <SettingToggle
        label="Confirm external websites"
        description="Ask before leaving Skills Manager."
        checked={settings.confirmExternalLinks}
        onChange={(confirmExternalLinks) => onSettingsChange({ confirmExternalLinks })}
      />
    </div>
  );
}

function TranslationSettings({ adapter }: { adapter: SkillsAdapter }) {
  const [providers, setProviders] = useState<TranslationProviderDescriptor[]>([]);
  const [providerId, setProviderId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("Loading providers...");
  const [busyAction, setBusyAction] = useState<"loading" | "saving" | "">("loading");
  const requestId = useRef(0);

  useEffect(() => {
    const nextRequestId = requestId.current + 1;
    requestId.current = nextRequestId;
    setBusyAction("loading");
    adapter
      .listTranslationProviders()
      .then((nextProviders) => {
        if (requestId.current !== nextRequestId) {
          return;
        }
        setProviders(nextProviders);
        setProviderId((current) => (nextProviders.some((provider) => provider.id === current) ? current : nextProviders[0]?.id ?? ""));
        setStatus("");
      })
      .catch((error: unknown) => {
        if (requestId.current !== nextRequestId) {
          return;
        }
        setProviders([]);
        setStatus(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        if (requestId.current === nextRequestId) {
          setBusyAction((current) => (current === "loading" ? "" : current));
        }
      });
  }, [adapter]);

  const selectedProvider = providers.find((provider) => provider.id === providerId);
  const canSave = Boolean(selectedProvider?.supportsConfiguration) && busyAction !== "saving";

  async function saveProviderConfig(): Promise<void> {
    if (!selectedProvider?.supportsConfiguration) {
      return;
    }
    const nextRequestId = requestId.current + 1;
    requestId.current = nextRequestId;
    setBusyAction("saving");
    setStatus("Saving provider...");
    try {
      const nextProviders = await adapter.saveTranslationProviderConfig({
        providerId: selectedProvider.id,
        apiKey: apiKey.trim() || undefined,
        model: model.trim() || undefined
      });
      if (requestId.current !== nextRequestId) {
        return;
      }
      setProviders(nextProviders);
      setProviderId((current) => (nextProviders.some((provider) => provider.id === current) ? current : nextProviders[0]?.id ?? ""));
      setApiKey("");
      setStatus("Provider saved.");
    } catch (error) {
      if (requestId.current !== nextRequestId) {
        return;
      }
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      if (requestId.current === nextRequestId) {
        setBusyAction((current) => (current === "saving" ? "" : current));
      }
    }
  }

  return (
    <div className="skills-setting-stack">
      <div className="skills-setting-grid">
        <label className="skills-setting-card">
          <span className="skills-setting-label">
            <Globe2 size={17} />
            <strong>Provider</strong>
          </span>
          <select value={providerId} onChange={(event) => setProviderId(event.target.value)} disabled={Boolean(busyAction)}>
            {providers.length ? (
              providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.label}
                  {provider.configured ? "" : " (not configured)"}
                </option>
              ))
            ) : (
              <option value="">No providers</option>
            )}
          </select>
        </label>
        <label className="skills-setting-card">
          <span className="skills-setting-label">
            <ShieldCheck size={17} />
            <strong>API key</strong>
          </span>
          <input
            autoComplete="off"
            disabled={!selectedProvider?.supportsConfiguration || Boolean(busyAction)}
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={selectedProvider?.supportsConfiguration ? "Paste key" : "Local provider"}
          />
        </label>
        <label className="skills-setting-card">
          <span className="skills-setting-label">
            <TypeIcon size={17} />
            <strong>Model</strong>
          </span>
          <input
            disabled={!selectedProvider?.supportsConfiguration || Boolean(busyAction)}
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="Provider default"
          />
        </label>
      </div>
      <div className="skills-settings-actions">
        <button type="button" onClick={saveProviderConfig} disabled={!canSave}>
          {busyAction === "saving" ? "Saving" : "Save provider"}
        </button>
        {status ? <span>{status}</span> : null}
      </div>
      <div className="skills-translation-provider-list" aria-label="Translation providers">
        {providers.map((provider) => (
          <div className="skills-translation-provider" key={provider.id}>
            <strong>{provider.label}</strong>
            <span>{provider.configured ? (provider.supportsConfiguration ? "Configured" : "Installed") : provider.supportsConfiguration ? "Needs API key" : "Unavailable"}</span>
            {provider.configurationHint ? <small>{provider.configurationHint}</small> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopSettings({
  settings,
  onSettingsChange
}: {
  settings: SkillsUserSettings;
  onSettingsChange(settings: Partial<SkillsUserSettings>): void;
}) {
  return (
    <div className="skills-setting-grid">
      <SettingSelect
        icon={<AppWindow size={17} />}
        label="Startup screen"
        value={settings.startupView}
        onChange={(value) => onSettingsChange({ startupView: value as StartupView })}
        options={[
          ["library", "Library"],
          ["settings", "Settings"]
        ]}
      />
      <SettingToggle
        label="Refresh repositories on launch"
        description="Check imported repositories when the app opens."
        checked={settings.autoRefreshRepositories}
        onChange={(autoRefreshRepositories) => onSettingsChange({ autoRefreshRepositories })}
      />
      <SettingToggle
        label="Confirm install actions"
        description="Require confirmation before install or uninstall."
        checked={settings.confirmInstallActions}
        onChange={(confirmInstallActions) => onSettingsChange({ confirmInstallActions })}
      />
      <SettingToggle
        label="Start minimized"
        description="Open the desktop app without focusing the main window."
        checked={settings.startMinimized}
        onChange={(startMinimized) => onSettingsChange({ startMinimized })}
      />
    </div>
  );
}

function SettingSelect({
  icon,
  label,
  value,
  options,
  onChange
}: {
  icon: ReactNode;
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange(value: string): void;
}) {
  return (
    <label className="skills-setting-card">
      <span className="skills-setting-label">
        {icon}
        <strong>{label}</strong>
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange(checked: boolean): void;
}) {
  return (
    <label className="skills-checkbox skills-setting-toggle">
      <input checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </label>
  );
}
