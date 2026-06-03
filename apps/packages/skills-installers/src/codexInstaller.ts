import { homedir } from "node:os";
import { join } from "node:path";
import type { InstallResult, InstallSkillsRequest, InstallStatus, InstallTarget, UninstallSkillsRequest } from "@skills-manager/core";
import type { AgentToolInstaller, ResolvedSkillSource } from "./AgentToolInstaller";
import { getInstallStatusForTargets, installSkillSources, pathExists, uninstallSkillSources } from "./installStatus";

export class CodexInstaller implements AgentToolInstaller {
  readonly id = "codex";
  readonly label = "Codex";

  constructor(
    private readonly homeDir = homedir(),
    private readonly projectRoot?: string
  ) {}

  async detectTargets(): Promise<InstallTarget[]> {
    const skillsDir = join(this.homeDir, ".codex", "skills");
    const slashCommandsDir = join(this.homeDir, ".codex", "prompts");
    const targets: InstallTarget[] = [
      {
        id: "codex-global",
        toolId: this.id,
        label: "Codex global",
        skillsDir,
        slashCommandsDir,
        exists: await pathExists(skillsDir)
      }
    ];
    if (this.projectRoot) {
      const projectSkillsDir = join(this.projectRoot, ".codex", "skills");
      targets.push({
        id: "codex-project",
        toolId: this.id,
        label: "Codex project",
        skillsDir: projectSkillsDir,
        slashCommandsDir: join(this.projectRoot, ".codex", "prompts"),
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
