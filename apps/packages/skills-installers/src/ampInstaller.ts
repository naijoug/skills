import { homedir } from "node:os";
import { join } from "node:path";
import type { InstallResult, InstallSkillsRequest, InstallStatus, InstallTarget, UninstallSkillsRequest } from "@skills-manager/core";
import type { AgentToolInstaller, ResolvedSkillSource } from "./AgentToolInstaller";
import { getInstallStatusForTargets, installSkillSources, pathExists, uninstallSkillSources } from "./installStatus";

export class AmpInstaller implements AgentToolInstaller {
  readonly id = "amp";
  readonly label = "Amp";

  constructor(
    private readonly homeDir = homedir(),
    private readonly projectRoot?: string
  ) {}

  async detectTargets(): Promise<InstallTarget[]> {
    const skillsDir = join(this.homeDir, ".agents", "skills");
    const targets: InstallTarget[] = [
      {
        id: "amp-global",
        toolId: this.id,
        label: "Amp global",
        skillsDir,
        exists: await pathExists(skillsDir)
      }
    ];
    if (this.projectRoot) {
      const projectSkillsDir = join(this.projectRoot, ".agents", "skills");
      targets.push({
        id: "amp-project",
        toolId: this.id,
        label: "Amp project",
        skillsDir: projectSkillsDir,
        exists: await pathExists(projectSkillsDir)
      });
    }
    return targets;
  }

  async getStatus(input: { skills: ResolvedSkillSource[]; targets: InstallTarget[] }): Promise<InstallStatus[]> {
    return getInstallStatusForTargets(input.skills, input.targets);
  }

  async install(input: InstallSkillsRequest & { skills: ResolvedSkillSource[]; targets: InstallTarget[] }): Promise<InstallResult> {
    return installSkillSources(input);
  }

  async uninstall(input: UninstallSkillsRequest & { skills: ResolvedSkillSource[]; targets: InstallTarget[] }): Promise<InstallResult> {
    return uninstallSkillSources(input);
  }
}
