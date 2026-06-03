import { homedir } from "node:os";
import { join } from "node:path";
import type { InstallResult, InstallSkillsRequest, InstallStatus, InstallTarget, UninstallSkillsRequest } from "@skills-manager/core";
import type { AgentToolInstaller, ResolvedSkillSource } from "./AgentToolInstaller";
import { getInstallStatusForTargets, installSkillSources, pathExists, uninstallSkillSources } from "./installStatus";

export class ClaudeCodeInstaller implements AgentToolInstaller {
  readonly id = "claude-code";
  readonly label = "Claude Code";

  constructor(
    private readonly homeDir = homedir(),
    private readonly projectRoot?: string
  ) {}

  async detectTargets(): Promise<InstallTarget[]> {
    const skillsDir = join(this.homeDir, ".claude", "skills");
    const slashCommandsDir = join(this.homeDir, ".claude", "commands");
    const targets: InstallTarget[] = [
      {
        id: "claude-code-global",
        toolId: this.id,
        label: "Claude Code global",
        skillsDir,
        slashCommandsDir,
        exists: await pathExists(skillsDir)
      }
    ];
    if (this.projectRoot) {
      const projectSkillsDir = join(this.projectRoot, ".claude", "skills");
      targets.push({
        id: "claude-code-project",
        toolId: this.id,
        label: "Claude Code project",
        skillsDir: projectSkillsDir,
        slashCommandsDir: join(this.projectRoot, ".claude", "commands"),
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
