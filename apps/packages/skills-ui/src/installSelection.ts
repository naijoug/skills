import type { InstallStatus, InstallTarget } from "@skills-manager/core";

export function nextSelectedInstallTargetIds(input: {
  currentTargetIds: string[];
  targets: InstallTarget[];
  statuses: InstallStatus[];
  resetSelection: boolean;
}): string[] {
  const installedTargetIds = input.statuses
    .filter((status) => status.installed)
    .map((status) => status.targetId);
  if (input.resetSelection) {
    return installedTargetIds;
  }

  const validTargetIds = new Set(input.targets.map((target) => target.id));
  const stillValid = input.currentTargetIds.filter((targetId) => validTargetIds.has(targetId));
  return stillValid.length ? stillValid : installedTargetIds;
}
