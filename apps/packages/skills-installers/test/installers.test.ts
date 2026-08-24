import { lstat, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  AmpInstaller,
  ClaudeCodeInstaller,
  CodexInstaller,
  getInstallStatusForTargets,
  installSkillSources,
  uninstallSkillSources
} from "../src";
import type { ResolvedSkillSource } from "../src";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("agent installers", () => {
  it("detects whether supported agent target directories exist", async () => {
    const home = await tempHome();
    const projectRoot = join(home, "project");
    const codex = new CodexInstaller(home, projectRoot);
    const claude = new ClaudeCodeInstaller(home, projectRoot);
    const amp = new AmpInstaller(home, projectRoot);

    expect((await codex.detectTargets())[0]).toMatchObject({ id: "codex-global", exists: false });
    expect((await codex.detectTargets())[1]).toMatchObject({ id: "codex-project", skillsDir: join(projectRoot, ".codex", "skills"), exists: false });
    expect((await claude.detectTargets())[0]).toMatchObject({ id: "claude-code-global", exists: false });
    expect((await claude.detectTargets())[1]).toMatchObject({ id: "claude-code-project", skillsDir: join(projectRoot, ".claude", "skills"), exists: false });
    expect((await amp.detectTargets())[0]).toMatchObject({ id: "amp-global", exists: false });
    expect((await amp.detectTargets())[1]).toMatchObject({ id: "amp-project", skillsDir: join(projectRoot, ".agents", "skills"), exists: false });

    await mkdir(join(home, ".codex", "skills"), { recursive: true });
    await mkdir(join(projectRoot, ".codex", "skills"), { recursive: true });
    await mkdir(join(home, ".claude", "skills"), { recursive: true });
    await mkdir(join(projectRoot, ".claude", "skills"), { recursive: true });
    await mkdir(join(home, ".agents", "skills"), { recursive: true });
    await mkdir(join(projectRoot, ".agents", "skills"), { recursive: true });

    expect((await codex.detectTargets())[0]).toMatchObject({ id: "codex-global", exists: true });
    expect((await codex.detectTargets())[1]).toMatchObject({ id: "codex-project", exists: true });
    expect((await claude.detectTargets())[0]).toMatchObject({ id: "claude-code-global", exists: true });
    expect((await claude.detectTargets())[1]).toMatchObject({ id: "claude-code-project", exists: true });
    expect((await amp.detectTargets())[0]).toMatchObject({ id: "amp-global", exists: true });
    expect((await amp.detectTargets())[1]).toMatchObject({ id: "amp-project", exists: true });
  });

  it("copies skills, reports installed status, and respects conflicts", async () => {
    const home = await tempHome();
    const sourceDir = join(home, "source-skill");
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, "SKILL.md"), "# Test Skill\n", "utf8");

    const codex = new CodexInstaller(home);
    const target = (await codex.detectTargets())[0];
    const skill: ResolvedSkillSource = {
      skillId: "local%3Aworkspace::manual%2Ftool%2Ftest%2FSKILL.md",
      sourceDir,
      installName: "ng-tool-test",
      relativePath: "manual/tool/test/SKILL.md",
      category: "manual/tool",
      summary: "Test slash command"
    };

    const installed = await installSkillSources({
      skills: [skill],
      targets: [target],
      mode: "copy",
      conflictPolicy: "fail",
      withSlashCommands: true
    });
    expect(installed.items).toEqual([
      expect.objectContaining({ skillId: skill.skillId, targetId: target.id, status: "installed" })
    ]);
    await expect(readFile(join(target.skillsDir, "ng-tool-test", "SKILL.md"), "utf8")).resolves.toContain("Test Skill");
    const manifest = JSON.parse(await readFile(join(target.skillsDir, ".skills-linker-manifest.json"), "utf8"));
    expect(manifest).toMatchObject({
      version: 1,
      skills: {
        "ng-tool-test": {
          mode: "copy",
          source: sourceDir
        }
      }
    });
    expect(manifest.skills["ng-tool-test"].installedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    await expect(readFile(join(target.slashCommandsDir!, "ng-tool-test.md"), "utf8")).resolves.toContain(
      "skills-linker:slash:ng-tool-test"
    );

    await expect(getInstallStatusForTargets([skill], [target])).resolves.toEqual([
      expect.objectContaining({ installed: true, conflict: false })
    ]);

    const conflicted = await installSkillSources({
      skills: [skill],
      targets: [target],
      mode: "copy",
      conflictPolicy: "fail"
    });
    expect(conflicted.items).toEqual([expect.objectContaining({ status: "conflict" })]);

    const uninstalled = await uninstallSkillSources({ skills: [skill], targets: [target], withSlashCommands: true });
    expect(uninstalled.items).toEqual([expect.objectContaining({ status: "uninstalled" })]);
    await expect(readFile(join(target.slashCommandsDir!, "ng-tool-test.md"), "utf8")).rejects.toThrow();
    await expect(readFile(join(target.skillsDir, ".skills-linker-manifest.json"), "utf8")).rejects.toThrow();
    await expect(getInstallStatusForTargets([skill], [target])).resolves.toEqual([
      expect.objectContaining({ installed: false, conflict: false })
    ]);

    const missing = await uninstallSkillSources({ skills: [skill], targets: [target], withSlashCommands: true });
    expect(missing.items).toEqual([expect.objectContaining({ status: "missing" })]);
  });

  it("symlinks skills and records symlink mode in the manifest", async () => {
    const home = await tempHome();
    const sourceDir = join(home, "source-skill");
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, "SKILL.md"), "# Test Skill\n", "utf8");

    const target = (await new CodexInstaller(home).detectTargets())[0];
    const skill: ResolvedSkillSource = {
      skillId: "local%3Aworkspace::manual%2Ftool%2Ftest%2FSKILL.md",
      sourceDir,
      installName: "ng-tool-test",
      relativePath: "manual/tool/test/SKILL.md",
      category: "manual/tool"
    };

    const installed = await installSkillSources({
      skills: [skill],
      targets: [target],
      mode: "symlink",
      conflictPolicy: "fail"
    });

    expect(installed.items).toEqual([expect.objectContaining({ status: "installed" })]);
    expect((await lstat(join(target.skillsDir, "ng-tool-test"))).isSymbolicLink()).toBe(true);
    await expect(readFile(join(target.skillsDir, "ng-tool-test", "SKILL.md"), "utf8")).resolves.toContain("Test Skill");
    await expect(readFile(join(target.skillsDir, ".skills-linker-manifest.json"), "utf8")).resolves.toContain('"mode": "symlink"');

    const uninstalled = await uninstallSkillSources({ skills: [skill], targets: [target] });
    expect(uninstalled.items).toEqual([expect.objectContaining({ status: "uninstalled" })]);
    await expect(lstat(join(target.skillsDir, "ng-tool-test"))).rejects.toThrow();
  });

  it("reads legacy TSV manifests and migrates them on write", async () => {
    const home = await tempHome();
    const sourceDir = join(home, "source-skill");
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, "SKILL.md"), "# Test Skill\n", "utf8");

    const target = (await new CodexInstaller(home).detectTargets())[0];
    const skill: ResolvedSkillSource = {
      skillId: "local%3Aworkspace::manual%2Ftool%2Ftest%2FSKILL.md",
      sourceDir,
      installName: "ng-tool-test",
      relativePath: "manual/tool/test/SKILL.md",
      category: "manual/tool"
    };

    await mkdir(join(target.skillsDir, "ng-tool-test"), { recursive: true });
    await writeFile(join(target.skillsDir, "ng-tool-test", "SKILL.md"), "# Test Skill\n", "utf8");
    await writeFile(
      join(target.skillsDir, ".skills-linker-manifest.tsv"),
      `ng-tool-test\tcopy\t${sourceDir}\t2026-01-01T00:00:00Z\n`,
      "utf8"
    );

    await expect(getInstallStatusForTargets([skill], [target])).resolves.toEqual([
      expect.objectContaining({ installed: true, conflict: false })
    ]);

    const uninstalled = await uninstallSkillSources({ skills: [skill], targets: [target] });
    expect(uninstalled.items).toEqual([expect.objectContaining({ status: "uninstalled" })]);
    await expect(readFile(join(target.skillsDir, ".skills-linker-manifest.tsv"), "utf8")).rejects.toThrow();
    await expect(readFile(join(target.skillsDir, ".skills-linker-manifest.json"), "utf8")).rejects.toThrow();
  });

  it("rejects unsupported install modes and conflict policies", async () => {
    const home = await tempHome();
    const sourceDir = join(home, "source-skill");
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, "SKILL.md"), "# Test Skill\n", "utf8");

    const target = (await new CodexInstaller(home).detectTargets())[0];
    const skill: ResolvedSkillSource = {
      skillId: "local%3Aworkspace::manual%2Ftool%2Ftest%2FSKILL.md",
      sourceDir,
      installName: "ng-tool-test",
      relativePath: "manual/tool/test/SKILL.md",
      category: "manual/tool"
    };

    await expect(
      installSkillSources({
        skills: [skill],
        targets: [target],
        mode: "move" as never,
        conflictPolicy: "fail"
      })
    ).rejects.toThrow("Unsupported install mode: move");
    await expect(
      installSkillSources({
        skills: [skill],
        targets: [target],
        mode: "copy",
        conflictPolicy: "replace" as never
      })
    ).rejects.toThrow("Unsupported install conflict policy: replace");
  });

  it("does not uninstall destinations that are not manifest-managed", async () => {
    const home = await tempHome();
    const sourceDir = join(home, "source-skill");
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, "SKILL.md"), "# Test Skill\n", "utf8");

    const target = (await new CodexInstaller(home).detectTargets())[0];
    const destination = join(target.skillsDir, "ng-tool-test");
    await mkdir(destination, { recursive: true });
    await writeFile(join(destination, "SKILL.md"), "# User Skill\n", "utf8");
    const skill: ResolvedSkillSource = {
      skillId: "local%3Aworkspace::manual%2Ftool%2Ftest%2FSKILL.md",
      sourceDir,
      installName: "ng-tool-test",
      relativePath: "manual/tool/test/SKILL.md",
      category: "manual/tool"
    };

    await expect(getInstallStatusForTargets([skill], [target])).resolves.toEqual([
      expect.objectContaining({ installed: false, conflict: true })
    ]);

    const result = await uninstallSkillSources({
      skills: [skill],
      targets: [target],
      withSlashCommands: true
    });

    expect(result.items).toEqual([expect.objectContaining({ status: "skipped", message: expect.stringContaining("not managed") })]);
    await expect(readFile(join(destination, "SKILL.md"), "utf8")).resolves.toContain("User Skill");
  });
});

async function tempHome(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "skills-installers-"));
  tempDirs.push(dir);
  return dir;
}
