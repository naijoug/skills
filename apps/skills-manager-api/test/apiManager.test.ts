import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiManager, normalizeGitHubUrl, readSkillSources } from "../src/apiManager";

const repoRoot = join(import.meta.dirname, "../../..");
const dataDirs: string[] = [];

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  await Promise.all(dataDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("apiManager", () => {
  it("normalizes GitHub repository URLs", () => {
    expect(normalizeGitHubUrl("https://github.com/openai/codex.git")).toMatchObject({
      id: "github:openai/codex",
      name: "openai/codex",
      slug: "openai--codex",
      cloneUrl: "https://github.com/openai/codex.git"
    });
    expect(normalizeGitHubUrl("https://gitlab.com/acme/platform/skills.git")).toMatchObject({
      id: "gitlab:acme/platform/skills",
      name: "acme/platform/skills",
      slug: "gitlab--acme-platform-skills",
      cloneUrl: "https://gitlab.com/acme/platform/skills.git"
    });
    expect(normalizeGitHubUrl("https://gitlab.com/acme/platform/skills/-/tree/main")).toMatchObject({
      id: "gitlab:acme/platform/skills",
      cloneUrl: "https://gitlab.com/acme/platform/skills.git"
    });
  });

  it("rejects missing URLs and unsupported repository sources", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "skills-manager-api-"));
    dataDirs.push(dataDir);
    const manager = new ApiManager({ repoRoot, dataDir });

    await expect(manager.importRepository({ url: "" })).rejects.toThrow("Missing repository URL");
    await expect(
      manager.importRepository({ url: "https://github.com/acme/skills", source: "desktop-local" as never })
    ).rejects.toThrow("Unsupported repository source");
  });

  it("reads local workspace skills", async () => {
    const sources = await readSkillSources(join(repoRoot, "skills"));
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.some((source) => source.relativePath === "auto/in-english/SKILL.md")).toBe(true);
  });

  it("builds a local library without imported repositories", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "skills-manager-api-"));
    dataDirs.push(dataDir);
    const manager = new ApiManager({ repoRoot, dataDir });
    const library = await manager.listLibrary();
    const expectedLocalSkillCount = (await readSkillSources(join(repoRoot, "skills"))).length;

    expect(library.groups).toHaveLength(1);
    expect(library.groups[0]).toMatchObject({ id: "local:workspace", skillCount: expectedLocalSkillCount });
    expect(library.skills).toHaveLength(expectedLocalSkillCount);
    expect(library.skills.map((skill) => skill.title)).toEqual(expect.arrayContaining(["API Design Review", "In English"]));
  });

  it("imports GitHub repositories through the read-only GitHub API path", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "skills-manager-api-"));
    dataDirs.push(dataDir);
    const requests: RequestInit[] = [];
    vi.stubEnv("GH_TOKEN", "gh-token-test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        requests.push(init ?? {});
        if (url === "https://api.github.com/repos/acme/skills") {
          return jsonResponse({ default_branch: "trunk" });
        }
        if (url.endsWith("/git/trees/trunk?recursive=1")) {
          return jsonResponse({
            tree: [
              { path: "SKILL.md", type: "blob", sha: "root-skill-sha" },
              { path: "skill.yaml", type: "blob", sha: "root-manifest-sha" },
              { path: "skills/example/SKILL.md", type: "blob", sha: "skill-sha" },
              { path: "skills/example/skill.yaml", type: "blob", sha: "manifest-sha" },
              { path: "skills/example/references/checklist.md", type: "blob", sha: "reference-sha" }
            ]
          });
        }
        if (url.endsWith("/git/blobs/root-skill-sha")) {
          return jsonResponse({ encoding: "base64", content: Buffer.from("# Root Skill\n\nImported from the repository root.").toString("base64") });
        }
        if (url.endsWith("/git/blobs/root-manifest-sha")) {
          return jsonResponse({ encoding: "base64", content: Buffer.from("id: root-example\nsummary: Root API fixture").toString("base64") });
        }
        if (url.endsWith("/git/blobs/skill-sha")) {
          return jsonResponse({ encoding: "base64", content: Buffer.from("# Example Skill\n\nImported through GitHub API.").toString("base64") });
        }
        if (url.endsWith("/git/blobs/manifest-sha")) {
          return jsonResponse({ encoding: "base64", content: Buffer.from("id: example\nsummary: API fixture").toString("base64") });
        }
        if (url.endsWith("/git/blobs/reference-sha")) {
          return jsonResponse({ encoding: "base64", content: Buffer.from("# Checklist\n\n- Review inputs").toString("base64") });
        }
        return jsonResponse({ message: "unexpected URL" }, 404);
      })
    );

    const manager = new ApiManager({ repoRoot, dataDir });
    const library = await manager.importRepository({ url: "https://github.com/acme/skills", source: "github-api" });

    expect(library.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "github:acme/skills", kind: "github-api", skillCount: 2 })])
    );
    expect(library.skills).toEqual(expect.arrayContaining([expect.objectContaining({ title: "Example Skill", groupName: "acme/skills" })]));
    expect(library.skills).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "Root Skill", relativePath: "SKILL.md", groupName: "acme/skills" })])
    );
    const exampleSkill = library.skills.find((skill) => skill.title === "Example Skill");
    expect(exampleSkill).toBeDefined();
    await expect(manager.getSkillDetail(exampleSkill!.id)).resolves.toMatchObject({
      relatedFiles: [
        expect.objectContaining({
          relativePath: "skills/example/references/checklist.md",
          kind: "reference",
          content: "# Checklist\n\n- Review inputs"
        })
      ]
    });
    const saved = JSON.parse(await readFile(join(dataDir, "library.json"), "utf8"));
    expect(saved.repositories[0]).toMatchObject({ source: "github-api", slug: "acme--skills", defaultBranch: "trunk" });
    expect(requests.every((request) => headersObject(request.headers).Authorization === "Bearer gh-token-test")).toBe(true);

    const removed = await manager.removeRepository({ repositoryId: "github:acme/skills" });
    expect(removed.groups).toEqual([expect.objectContaining({ id: "local:workspace" })]);
    expect(removed.skills.every((skill) => skill.groupId === "local:workspace")).toBe(true);
    const savedAfterRemove = JSON.parse(await readFile(join(dataDir, "library.json"), "utf8"));
    expect(savedAfterRemove.repositories).toEqual([]);
  });

  it("imports, refreshes, and removes GitHub repositories through the server cache path", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "skills-manager-api-"));
    dataDirs.push(dataDir);
    const gitLog = join(dataDir, "git.log");
    await installFakeGit(dataDir, gitLog);

    const manager = new ApiManager({ repoRoot, dataDir });
    const imported = await manager.importRepository({ url: "https://github.com/acme/skills", source: "server-cache" });

    expect(imported.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "github:acme/skills", kind: "web-cache", skillCount: 1 })])
    );
    expect(imported.skills).toEqual(expect.arrayContaining([expect.objectContaining({ title: "Server Cache Skill" })]));

    const refreshed = await manager.refreshRepositories();
    expect(refreshed.skills).toEqual(expect.arrayContaining([expect.objectContaining({ title: "Server Cache Skill Refreshed" })]));

    const removed = await manager.removeRepository({ repositoryId: "github:acme/skills" });
    expect(removed.groups).toEqual([expect.objectContaining({ id: "local:workspace" })]);
    await expect(readFile(join(dataDir, "repos/acme--skills/skills/cache/SKILL.md"), "utf8")).rejects.toThrow();

    const gitlabImported = await manager.importRepository({ url: "https://gitlab.com/acme/platform/skills.git", source: "server-cache" });
    expect(gitlabImported.groups).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "gitlab:acme/platform/skills", kind: "gitlab", skillCount: 1 })])
    );

    const log = await readFile(gitLog, "utf8");
    expect(log).toContain("clone --depth 1 https://github.com/acme/skills.git");
    expect(log).toContain("clone --depth 1 https://gitlab.com/acme/platform/skills.git");
    expect(log).toContain("pull --ff-only");
  });

  it("refreshes GitHub API repositories against the latest default branch", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "skills-manager-api-"));
    dataDirs.push(dataDir);
    let defaultBranch = "trunk";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === "https://api.github.com/repos/acme/skills") {
          return jsonResponse({ default_branch: defaultBranch });
        }
        const treeMatch = url.match(/\/git\/trees\/([^?]+)\?recursive=1$/);
        if (treeMatch) {
          const branch = decodeURIComponent(treeMatch[1]);
          return jsonResponse({
            tree: [{ path: `skills/${branch}/SKILL.md`, type: "blob", sha: `skill-${branch}` }]
          });
        }
        if (url.endsWith("/git/blobs/skill-trunk")) {
          return jsonResponse({ encoding: "base64", content: Buffer.from("# Trunk Skill").toString("base64") });
        }
        if (url.endsWith("/git/blobs/skill-main")) {
          return jsonResponse({ encoding: "base64", content: Buffer.from("# Main Skill").toString("base64") });
        }
        return jsonResponse({ message: "unexpected URL" }, 404);
      })
    );

    const manager = new ApiManager({ repoRoot, dataDir });
    await manager.importRepository({ url: "https://github.com/acme/skills", source: "github-api" });
    defaultBranch = "main";

    const refreshed = await manager.refreshRepositories();

    expect(refreshed.skills).toEqual(expect.arrayContaining([expect.objectContaining({ title: "Main Skill", groupName: "acme/skills" })]));
    const saved = JSON.parse(await readFile(join(dataDir, "library.json"), "utf8"));
    expect(saved.repositories[0]).toMatchObject({ source: "github-api", defaultBranch: "main", default_branch: "main" });
  });

  it("fails clearly when the GitHub API tree response is truncated", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "skills-manager-api-"));
    dataDirs.push(dataDir);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === "https://api.github.com/repos/acme/huge-skills") {
          return jsonResponse({ default_branch: "main" });
        }
        if (url.endsWith("/git/trees/main?recursive=1")) {
          return jsonResponse({
            truncated: true,
            tree: [{ path: "SKILL.md", type: "blob", sha: "skill-sha" }]
          });
        }
        return jsonResponse({ message: "unexpected URL" }, 404);
      })
    );

    const manager = new ApiManager({ repoRoot, dataDir });

    await expect(manager.importRepository({ url: "https://github.com/acme/huge-skills", source: "github-api" })).rejects.toThrow(
      "truncated repository tree"
    );
    await expect(readFile(join(dataDir, "library.json"), "utf8")).rejects.toThrow();
  });
});

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function headersObject(headers: RequestInit["headers"]): Record<string, string> {
  if (!headers || Array.isArray(headers) || headers instanceof Headers) {
    return {};
  }
  return headers as Record<string, string>;
}

async function installFakeGit(dataDir: string, gitLog: string): Promise<void> {
  const binDir = join(dataDir, "bin");
  await mkdir(binDir, { recursive: true });
  const gitPath = join(binDir, "git");
  await writeFile(
    gitPath,
    [
      "#!/usr/bin/env bash",
      "set -euo pipefail",
      "printf '%s\\t%s\\n' \"$(pwd)\" \"$*\" >> \"$FAKE_GIT_LOG\"",
      "case \"$1\" in",
      "  clone)",
      "    target=\"${@: -1}\"",
      "    mkdir -p \"$target/.git\" \"$target/skills/cache\"",
      "    cat > \"$target/skills/cache/SKILL.md\" <<'SKILL'",
      "---",
      "name: server-cache-skill",
      "description: Imported through fake git clone.",
      "---",
      "# Server Cache Skill",
      "",
      "Imported through server cache.",
      "SKILL",
      "    cat > \"$target/skills/cache/skill.yaml\" <<'YAML'",
      "id: server-cache-skill",
      "summary: fake git fixture",
      "YAML",
      "    ;;",
      "  pull)",
      "    mkdir -p \"$(pwd)/skills/cache\"",
      "    cat > \"$(pwd)/skills/cache/SKILL.md\" <<'SKILL'",
      "---",
      "name: server-cache-skill",
      "description: Refreshed through fake git pull.",
      "---",
      "# Server Cache Skill Refreshed",
      "",
      "Refreshed through server cache.",
      "SKILL",
      "    ;;",
      "  *)",
      "    echo \"unexpected fake git command: $*\" >&2",
      "    exit 2",
      "    ;;",
      "esac",
      ""
    ].join("\n"),
    "utf8"
  );
  await chmod(gitPath, 0o755);
  vi.stubEnv("FAKE_GIT_LOG", gitLog);
  vi.stubEnv("PATH", `${binDir}:${process.env.PATH ?? ""}`);
}
