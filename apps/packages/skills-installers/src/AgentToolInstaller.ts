import type { InstallResult, InstallSkillsRequest, InstallStatus, InstallTarget, UninstallSkillsRequest } from "@skills-manager/core";

export interface ResolvedSkillSource {
  skillId: string;
  sourceDir: string;
  installName: string;
  relativePath?: string;
  category?: string;
  summary?: string;
}

export interface AgentToolInstaller {
  id: string;
  label: string;
  detectTargets(): Promise<InstallTarget[]>;
  getStatus(input: { skills: ResolvedSkillSource[]; targets: InstallTarget[] }): Promise<InstallStatus[]>;
  install(input: InstallSkillsRequest & { skills: ResolvedSkillSource[]; targets: InstallTarget[] }): Promise<InstallResult>;
  uninstall?(input: UninstallSkillsRequest & { skills: ResolvedSkillSource[]; targets: InstallTarget[] }): Promise<InstallResult>;
}
