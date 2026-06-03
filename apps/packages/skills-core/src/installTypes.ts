export type InstallMode = "copy" | "symlink";
export type InstallConflictPolicy = "skip" | "overwrite" | "fail";

export interface InstallTarget {
  id: string;
  toolId: string;
  label: string;
  skillsDir: string;
  slashCommandsDir?: string;
  exists: boolean;
}

export interface InstallStatus {
  skillId: string;
  targetId: string;
  installed: boolean;
  conflict: boolean;
  destinationPath: string;
}

export interface InstallSkillsRequest {
  skillIds: string[];
  targetIds: string[];
  mode: InstallMode;
  conflictPolicy: InstallConflictPolicy;
  withSlashCommands?: boolean;
}

export interface InstallResultItem {
  skillId: string;
  targetId: string;
  destinationPath: string;
  status: "installed" | "uninstalled" | "missing" | "skipped" | "conflict" | "failed";
  message?: string;
}

export interface InstallResult {
  items: InstallResultItem[];
}

export interface UninstallSkillsRequest {
  skillIds: string[];
  targetIds: string[];
  withSlashCommands?: boolean;
}
