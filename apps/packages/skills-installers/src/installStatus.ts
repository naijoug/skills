import { mkdir, rm, symlink, cp, lstat, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type {
  InstallConflictPolicy,
  InstallMode,
  InstallResult,
  InstallResultItem,
  InstallStatus,
  InstallTarget
} from "@skills-manager/core";
import type { ResolvedSkillSource } from "./AgentToolInstaller";

export function destinationFor(target: InstallTarget, skill: ResolvedSkillSource): string {
  return join(target.skillsDir, skill.installName);
}

export async function getInstallStatusForTargets(
  skills: ResolvedSkillSource[],
  targets: InstallTarget[]
): Promise<InstallStatus[]> {
  const statuses: InstallStatus[] = [];
  for (const target of targets) {
    for (const skill of skills) {
      const destinationPath = destinationFor(target, skill);
      const destinationExists = await pathExists(destinationPath);
      const managed = destinationExists && (await hasManifestEntry(target, skill));
      statuses.push({
        skillId: skill.skillId,
        targetId: target.id,
        destinationPath,
        installed: managed,
        conflict: destinationExists && !managed
      });
    }
  }
  return statuses;
}

export async function installSkillSources(input: {
  skills: ResolvedSkillSource[];
  targets: InstallTarget[];
  mode: InstallMode;
  conflictPolicy: InstallConflictPolicy;
  withSlashCommands?: boolean;
}): Promise<InstallResult> {
  validateInstallMode(input.mode);
  validateConflictPolicy(input.conflictPolicy);
  const items: InstallResultItem[] = [];

  for (const target of input.targets) {
    await mkdir(target.skillsDir, { recursive: true });
    for (const skill of input.skills) {
      const destinationPath = destinationFor(target, skill);
      const destinationExists = await pathExists(destinationPath);

      if (destinationExists && input.conflictPolicy === "fail") {
        items.push({
          skillId: skill.skillId,
          targetId: target.id,
          destinationPath,
          status: "conflict",
          message: "Destination already exists."
        });
        continue;
      }
      if (destinationExists && input.conflictPolicy === "skip") {
        items.push({
          skillId: skill.skillId,
          targetId: target.id,
          destinationPath,
          status: "skipped",
          message: "Destination already exists."
        });
        continue;
      }
      if (destinationExists && input.conflictPolicy === "overwrite") {
        await rm(destinationPath, { recursive: true, force: true });
      }

      await mkdir(dirname(destinationPath), { recursive: true });
      if (input.mode === "symlink") {
        await symlink(skill.sourceDir, destinationPath, "dir");
      } else {
        await cp(skill.sourceDir, destinationPath, { recursive: true });
      }
      if (input.withSlashCommands) {
        await installSlashCommand(target, skill, input.conflictPolicy === "overwrite");
      }
      await upsertManifest(target, skill, input.mode);
      items.push({
        skillId: skill.skillId,
        targetId: target.id,
        destinationPath,
        status: "installed"
      });
    }
  }

  return { items };
}

function validateInstallMode(mode: string): asserts mode is InstallMode {
  if (mode !== "copy" && mode !== "symlink") {
    throw new Error(`Unsupported install mode: ${mode}`);
  }
}

function validateConflictPolicy(policy: string): asserts policy is InstallConflictPolicy {
  if (policy !== "fail" && policy !== "skip" && policy !== "overwrite") {
    throw new Error(`Unsupported install conflict policy: ${policy}`);
  }
}

export async function uninstallSkillSources(input: {
  skills: ResolvedSkillSource[];
  targets: InstallTarget[];
  withSlashCommands?: boolean;
}): Promise<InstallResult> {
  const items: InstallResultItem[] = [];

  for (const target of input.targets) {
    for (const skill of input.skills) {
      const destinationPath = destinationFor(target, skill);
      if (!(await pathExists(destinationPath))) {
        await removeManifestEntry(target, skill);
        items.push({
          skillId: skill.skillId,
          targetId: target.id,
          destinationPath,
          status: "missing",
          message: "Destination does not exist."
        });
        continue;
      }

      if (!(await hasManifestEntry(target, skill))) {
        items.push({
          skillId: skill.skillId,
          targetId: target.id,
          destinationPath,
          status: "skipped",
          message: "Destination exists but is not managed by Skills Manager."
        });
        continue;
      }

      if (input.withSlashCommands) {
        await uninstallSlashCommand(target, skill);
      }
      await rm(destinationPath, { recursive: true, force: true });
      await removeManifestEntry(target, skill);
      items.push({
        skillId: skill.skillId,
        targetId: target.id,
        destinationPath,
        status: "uninstalled"
      });
    }
  }

  return { items };
}

async function upsertManifest(target: InstallTarget, skill: ResolvedSkillSource, mode: InstallMode): Promise<void> {
  await mkdir(target.skillsDir, { recursive: true });
  const manifestPath = join(target.skillsDir, ".skills-linker-manifest.tsv");
  const existing = await readManifestLines(manifestPath);
  const nextLines = existing.filter((line) => line.split("\t")[0] !== skill.installName);
  nextLines.push([skill.installName, mode, skill.sourceDir, new Date().toISOString().replace(/\.\d{3}Z$/, "Z")].join("\t"));
  await writeFile(manifestPath, `${nextLines.join("\n")}\n`, "utf8");
}

async function removeManifestEntry(target: InstallTarget, skill: ResolvedSkillSource): Promise<void> {
  const manifestPath = join(target.skillsDir, ".skills-linker-manifest.tsv");
  const existing = await readManifestLines(manifestPath);
  if (!existing.length) {
    return;
  }
  const nextLines = existing.filter((line) => line.split("\t")[0] !== skill.installName);
  if (nextLines.length) {
    await writeFile(manifestPath, `${nextLines.join("\n")}\n`, "utf8");
  } else {
    await rm(manifestPath, { force: true });
  }
}

async function hasManifestEntry(target: InstallTarget, skill: ResolvedSkillSource): Promise<boolean> {
  const manifestPath = join(target.skillsDir, ".skills-linker-manifest.tsv");
  return (await readManifestLines(manifestPath)).some((line) => line.split("\t")[0] === skill.installName);
}

async function readManifestLines(path: string): Promise<string[]> {
  try {
    return (await readFile(path, "utf8")).split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

async function installSlashCommand(target: InstallTarget, skill: ResolvedSkillSource, overwrite: boolean): Promise<void> {
  if (!target.slashCommandsDir || !isManualSkill(skill)) {
    return;
  }
  const commandPath = slashCommandPath(target, skill);
  if ((await pathExists(commandPath)) && !overwrite && !(await isManagedSlashCommand(commandPath, skill.installName))) {
    return;
  }
  await mkdir(dirname(commandPath), { recursive: true });
  await writeFile(commandPath, slashCommandContent(target, skill), "utf8");
}

async function uninstallSlashCommand(target: InstallTarget, skill: ResolvedSkillSource): Promise<void> {
  if (!target.slashCommandsDir || !isManualSkill(skill)) {
    return;
  }
  const commandPath = slashCommandPath(target, skill);
  if (await isManagedSlashCommand(commandPath, skill.installName)) {
    await rm(commandPath, { force: true });
  }
}

function isManualSkill(skill: ResolvedSkillSource): boolean {
  return skill.category === "manual" || Boolean(skill.category?.startsWith("manual/")) || Boolean(skill.relativePath?.startsWith("manual/"));
}

function slashCommandPath(target: InstallTarget, skill: ResolvedSkillSource): string {
  return join(target.slashCommandsDir!, `${skill.installName}.md`);
}

function slashCommandContent(target: InstallTarget, skill: ResolvedSkillSource): string {
  const marker = `<!-- skills-linker:slash:${skill.installName} -->`;
  const skillPath = join(skill.sourceDir, "SKILL.md");
  if (target.toolId === "claude-code") {
    return [
      "---",
      `description: ${skill.summary || `Invoke the ${skill.installName} skill`}`,
      "argument-hint: [extra context]",
      "---",
      marker,
      "",
      `Use the \`${skill.installName}\` skill for this request. Read its definition at:`,
      skillPath,
      "",
      "$ARGUMENTS",
      ""
    ].join("\n");
  }
  return [
    marker,
    "",
    `Use the \`${skill.installName}\` skill for this request. Read its definition at:`,
    skillPath,
    ""
  ].join("\n");
}

async function isManagedSlashCommand(path: string, installName: string): Promise<boolean> {
  try {
    return (await readFile(path, "utf8")).includes(`<!-- skills-linker:slash:${installName} -->`);
  } catch {
    return false;
  }
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch {
    return false;
  }
}
