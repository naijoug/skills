import { useEffect, useRef, useState } from "react";
import type { InstallConflictPolicy, InstallMode, InstallStatus, InstallTarget } from "@skills-manager/core";
import type { SkillsAdapter } from "@skills-manager/platform";
import { nextSelectedInstallTargetIds } from "../installSelection";
import { installPanelAvailability } from "../installPanelState";

export interface InstallPanelProps {
  adapter: SkillsAdapter;
  skillId: string;
}

export function InstallPanel({ adapter, skillId }: InstallPanelProps) {
  const [targets, setTargets] = useState<InstallTarget[]>([]);
  const [statuses, setStatuses] = useState<InstallStatus[]>([]);
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [mode, setMode] = useState<InstallMode>("copy");
  const [conflictPolicy, setConflictPolicy] = useState<InstallConflictPolicy>("fail");
  const [withSlashCommands, setWithSlashCommands] = useState(false);
  const [message, setMessage] = useState("");
  const [busyAction, setBusyAction] = useState<"loading" | "installing" | "uninstalling" | "">("");
  const loadRequestId = useRef(0);

  useEffect(() => {
    void loadTargets({ showBusy: true, resetSelection: true });
  }, [adapter, skillId]);

  async function loadTargets(options: { showBusy?: boolean; resetSelection?: boolean } = {}): Promise<void> {
    const showBusy = options.showBusy ?? false;
    const resetSelection = options.resetSelection ?? false;
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;
    if (showBusy) {
      setBusyAction("loading");
    }
    if (resetSelection) {
      setMessage("");
    }
    try {
      const [nextTargets, nextStatuses] = await Promise.all([
        adapter.listInstallTargets(),
        adapter.getInstallStatus({ skillIds: [skillId] })
      ]);
      if (loadRequestId.current !== requestId) {
        return;
      }
      setTargets(nextTargets);
      setStatuses(nextStatuses);
      setSelectedTargetIds((current) => {
        return nextSelectedInstallTargetIds({
          currentTargetIds: current,
          targets: nextTargets,
          statuses: nextStatuses,
          resetSelection
        });
      });
    } catch (error) {
      if (loadRequestId.current !== requestId) {
        return;
      }
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      if (showBusy && loadRequestId.current === requestId) {
        setBusyAction((current) => (current === "loading" ? "" : current));
      }
    }
  }

  async function install(): Promise<void> {
    if (!selectedTargetIds.length || busyAction) {
      return;
    }
    setBusyAction("installing");
    setMessage("Installing skill...");
    try {
      const result = await adapter.installSkills({
        skillIds: [skillId],
        targetIds: selectedTargetIds,
        mode,
        conflictPolicy,
        withSlashCommands
      });
      setMessage(formatInstallResult(result.items, targets));
      await loadTargets();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyAction((current) => (current === "installing" ? "" : current));
    }
  }

  async function uninstall(): Promise<void> {
    if (!selectedTargetIds.length || busyAction) {
      return;
    }
    setBusyAction("uninstalling");
    setMessage("Uninstalling skill...");
    try {
      const result = await adapter.uninstallSkills({
        skillIds: [skillId],
        targetIds: selectedTargetIds,
        withSlashCommands
      });
      setMessage(formatInstallResult(result.items, targets));
      await loadTargets();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyAction((current) => (current === "uninstalling" ? "" : current));
    }
  }

  const availability = installPanelAvailability({ targetCount: targets.length, busyAction });

  return (
    <section className="skills-action-panel">
      <h3>Install</h3>
      {availability === "loading" ? <p>Loading install targets...</p> : null}
      {availability === "unavailable" ? <p>Local agent installation is available in the desktop app.</p> : null}
      {availability === "available" ? (
        <>
          <div className="skills-control-row compact">
            <select value={mode} onChange={(event) => setMode(event.target.value as InstallMode)} disabled={Boolean(busyAction)}>
              <option value="copy">Copy</option>
              <option value="symlink">Symlink</option>
            </select>
            <select value={conflictPolicy} onChange={(event) => setConflictPolicy(event.target.value as InstallConflictPolicy)} disabled={Boolean(busyAction)}>
              <option value="fail">Fail on conflict</option>
              <option value="skip">Skip existing</option>
              <option value="overwrite">Overwrite</option>
            </select>
          </div>
          {targets.map((target) => (
            <label key={target.id} className="skills-checkbox">
              <input
                checked={selectedTargetIds.includes(target.id)}
                disabled={Boolean(busyAction)}
                type="checkbox"
                onChange={(event) => {
                  setSelectedTargetIds((current) =>
                    event.target.checked ? [...current, target.id] : current.filter((id) => id !== target.id)
                  );
                }}
              />
              <span>
                <strong>{target.label}</strong>
                <small>
                  {statusLabel(statusFor(statuses, target.id))} · {target.skillsDir}
                </small>
              </span>
            </label>
          ))}
          {targets.some((target) => target.slashCommandsDir) ? (
            <label className="skills-checkbox">
              <input
                checked={withSlashCommands}
                disabled={Boolean(busyAction)}
                type="checkbox"
                onChange={(event) => setWithSlashCommands(event.target.checked)}
              />
              <span>
                <strong>Slash commands</strong>
                <small>Codex prompts / Claude commands</small>
              </span>
            </label>
          ) : null}
          <div className="skills-control-row compact">
            <button type="button" onClick={install} disabled={Boolean(busyAction) || !selectedTargetIds.length}>
              {busyAction === "installing" ? "Installing" : "Install skill"}
            </button>
            <button type="button" onClick={uninstall} disabled={Boolean(busyAction) || !selectedTargetIds.length}>
              {busyAction === "uninstalling" ? "Uninstalling" : "Uninstall skill"}
            </button>
          </div>
        </>
      ) : null}
      {message ? <p>{message}</p> : null}
    </section>
  );
}

function statusFor(statuses: InstallStatus[], targetId: string): InstallStatus | undefined {
  return statuses.find((status) => status.targetId === targetId);
}

function statusLabel(status: InstallStatus | undefined): string {
  if (status?.installed) {
    return "Installed";
  }
  if (status?.conflict) {
    return "Conflict";
  }
  return "Not installed";
}

function formatInstallResult(items: { targetId: string; status: string; message?: string }[], targets: InstallTarget[]): string {
  return items
    .map((item) => {
      const targetLabel = targets.find((target) => target.id === item.targetId)?.label ?? item.targetId;
      return `${targetLabel}: ${item.status}${item.message ? ` - ${item.message}` : ""}`;
    })
    .join("; ");
}
