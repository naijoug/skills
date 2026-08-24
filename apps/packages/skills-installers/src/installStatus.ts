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

const MANIFEST_FILENAME = ".skills-linker-manifest.json";
const LEGACY_MANIFEST_FILENAME = ".skills-linker-manifest.tsv";

interface SkillManifest {
  version: 1;
  skills: Record<string, SkillManifestEntry>;
}

interface SkillManifestEntry {
  mode: InstallMode;
  source: string;
  installedAt: string;
  updatedAt: string;
}

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
  const manifest = await readManifest(target);
  const now = nowIso();
  manifest.skills[skill.installName] = {
    mode,
    source: skill.sourceDir,
    installedAt: manifest.skills[skill.installName]?.installedAt ?? now,
    updatedAt: now
  };
  await writeManifest(target, manifest);
}

async function removeManifestEntry(target: InstallTarget, skill: ResolvedSkillSource): Promise<void> {
  const manifest = await readManifest(target);
  delete manifest.skills[skill.installName];
  await writeManifest(target, manifest);
}

async function hasManifestEntry(target: InstallTarget, skill: ResolvedSkillSource): Promise<boolean> {
  return Boolean((await readManifest(target)).skills[skill.installName]);
}

async function readManifest(target: InstallTarget): Promise<SkillManifest> {
  const manifestPath = join(target.skillsDir, MANIFEST_FILENAME);
  const legacyManifestPath = join(target.skillsDir, LEGACY_MANIFEST_FILENAME);
  try {
    const parsed = JSON.parse(await readFile(manifestPath, "utf8")) as Partial<SkillManifest>;
    return {
      version: 1,
      skills: parsed.skills && typeof parsed.skills === "object" && !Array.isArray(parsed.skills) ? parsed.skills : {}
    };
  } catch {
    return { version: 1, skills: await readLegacyManifest(legacyManifestPath) };
  }
}

async function writeManifest(target: InstallTarget, manifest: SkillManifest): Promise<void> {
  const manifestPath = join(target.skillsDir, MANIFEST_FILENAME);
  const legacyManifestPath = join(target.skillsDir, LEGACY_MANIFEST_FILENAME);
  if (!Object.keys(manifest.skills).length) {
    await rm(manifestPath, { force: true });
    await rm(legacyManifestPath, { force: true });
    return;
  }
  await writeFile(manifestPath, `${JSON.stringify({ version: 1, skills: manifest.skills }, null, 2)}\n`, "utf8");
  await rm(legacyManifestPath, { force: true });
}

async function readLegacyManifest(path: string): Promise<Record<string, SkillManifestEntry>> {
  try {
    const skills: Record<string, SkillManifestEntry> = {};
    for (const line of (await readFile(path, "utf8")).split(/\r?\n/).filter(Boolean)) {
      const [id, mode, source, timestamp] = line.split("\t");
      if (!id) {
        continue;
      }
      const installedAt = timestamp || nowIso();
      skills[id] = {
        mode: mode === "symlink" ? "symlink" : "copy",
        source: source || "",
        installedAt,
        updatedAt: installedAt
      };
    }
    return skills;
  } catch {
    return {};
  }
}

function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
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
