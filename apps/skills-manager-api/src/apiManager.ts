import { execFile } from "node:child_process";
import { readFile, readdir, stat, writeFile, mkdir, rm } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import {
  buildLibrary,
  decodeSkillId,
  parseSkillFile,
  type InstallResult,
  type InstallStatus,
  type InstallTarget,
  type SkillDetail,
  type SkillFileSource,
  type SkillGroup,
  type SkillTranslation,
  type SkillsLibrary,
  type TranslationProviderDescriptor
} from "@skills-manager/core";
import { OpenAITranslationProvider, TranslationProviderRegistry } from "@skills-manager/translation";

const execFileAsync = promisify(execFile);

const libraryFileName = "library.json";
const skipDirs = new Set([".git", ".hg", ".svn", ".ref", ".venv", "venv", "node_modules", "__pycache__", ".skills-manager-data"]);

export interface ApiManagerOptions {
  repoRoot: string;
  dataDir: string;
}

export interface ImportRepositoryInput {
  url: string;
  source?: "server-cache" | "github-api";
}

interface StoredRepository {
  id: string;
  name: string;
  url: string;
  clone_url?: string;
  slug?: string;
  source?: "server-cache" | "github-api";
  defaultBranch?: string;
  default_branch?: string;
  path?: string;
  importedAt?: string;
  updatedAt?: string;
  imported_at?: string;
  updated_at?: string;
}

interface StoredLibrary {
  version: 1;
  repositories: StoredRepository[];
}

interface GitHubRepoInfo {
  id: string;
  name: string;
  owner: string;
  repo: string;
  slug: string;
  url: string;
  cloneUrl: string;
  defaultBranch?: string;
}

export class ApiManager {
  private readonly reposDir: string;
  private readonly libraryFile: string;
  private readonly translationRegistry = new TranslationProviderRegistry();

  constructor(private readonly options: ApiManagerOptions) {
    this.reposDir = join(options.dataDir, "repos");
    this.libraryFile = join(options.dataDir, libraryFileName);
    this.translationRegistry.register(
      new OpenAITranslationProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.SKILLS_MANAGER_OPENAI_MODEL
      })
    );
  }

  async listLibrary(): Promise<SkillsLibrary> {
    const { groups, filesByGroup } = await this.collectLibrarySources();
    return buildLibrary(groups, filesByGroup);
  }

  async importRepository(input: ImportRepositoryInput): Promise<SkillsLibrary> {
    if (typeof input.url !== "string" || !input.url.trim()) {
      throw new ApiError("Missing GitHub repository URL.", 400);
    }
    const source = input.source ?? "server-cache";
    if (source !== "server-cache" && source !== "github-api") {
      throw new ApiError("Unsupported repository source.", 400);
    }
    const repo = normalizeGitHubUrl(input.url);
    const now = new Date().toISOString();
    const library = await this.loadStoredLibrary();
    const repositories = library.repositories.filter((item) => item.id !== repo.id);
    const existing = library.repositories.find((item) => item.id === repo.id);
    let defaultBranch = existing?.defaultBranch ?? existing?.default_branch;

    if (source === "server-cache") {
      await this.cloneOrPull(repo);
    } else {
      defaultBranch = await this.readGitHubDefaultBranch(repo);
      await this.readGitHubApiSources({ ...repo, defaultBranch });
    }

    repositories.push({
      id: repo.id,
      name: repo.name,
      url: repo.url,
      clone_url: repo.cloneUrl,
      slug: repo.slug,
      source,
      defaultBranch: source === "github-api" ? defaultBranch : undefined,
      importedAt: existing?.importedAt ?? now,
      updatedAt: now
    });
    repositories.sort((left, right) => left.name.localeCompare(right.name));
    await this.saveStoredLibrary({ version: 1, repositories });
    return this.listLibrary();
  }

  async refreshRepositories(): Promise<SkillsLibrary> {
    const library = await this.loadStoredLibrary();
    const updatedRepositories: StoredRepository[] = [];
    for (const repository of library.repositories) {
      const normalized = this.normalizeStoredRepository(repository);
      const updatedAt = new Date().toISOString();
      let nextRepository: StoredRepository = { ...repository, updatedAt, updated_at: updatedAt };
      if (normalized.source === "server-cache") {
        await runGit(["pull", "--ff-only"], normalized.path);
      } else {
        const defaultBranch = await this.readGitHubDefaultBranch(normalized.repoInfo);
        await this.readGitHubApiSources({ ...normalized.repoInfo, defaultBranch });
        nextRepository = { ...nextRepository, defaultBranch, default_branch: defaultBranch };
      }
      updatedRepositories.push(nextRepository);
    }
    await this.saveStoredLibrary({ version: 1, repositories: updatedRepositories });
    return this.listLibrary();
  }

  async removeRepository(input: { repositoryId: string }): Promise<SkillsLibrary> {
    if (input.repositoryId === "local:workspace") {
      throw new ApiError("The local workspace group cannot be removed.", 400);
    }
    const library = await this.loadStoredLibrary();
    const repository = library.repositories.find((item) => (item.id ?? normalizeGitHubUrl(item.url).id) === input.repositoryId);
    if (!repository) {
      throw new ApiError("Repository not found.", 404);
    }
    const repositories = library.repositories.filter((item) => (item.id ?? normalizeGitHubUrl(item.url).id) !== input.repositoryId);
    await this.saveStoredLibrary({ version: 1, repositories });

    const normalized = this.normalizeStoredRepository(repository);
    if (normalized.source === "server-cache" && isPathInside(normalized.path, this.reposDir)) {
      await rm(normalized.path, { recursive: true, force: true });
    }
    return this.listLibrary();
  }

  async getSkillDetail(skillId: string): Promise<SkillDetail> {
    const { groupId, relativePath } = decodeSkillId(skillId);
    const { groups, filesByGroup } = await this.collectLibrarySources();
    const group = groups.find((item) => item.id === groupId);
    const source = filesByGroup.get(groupId)?.find((item) => item.relativePath === relativePath);
    if (!group || !source) {
      throw new ApiError("Skill not found.", 404);
    }
    return parseSkillFile(group, source);
  }

  listTranslationProviders(): TranslationProviderDescriptor[] {
    return this.translationRegistry.listProviders();
  }

  saveTranslationProviderConfig(): TranslationProviderDescriptor[] {
    throw new ApiError("Web API does not accept translation provider secrets. Configure OPENAI_API_KEY on the server or use the desktop app.", 400);
  }

  async translateSkill(input: { skillId: string; targetLanguage: string; providerId?: string }): Promise<SkillTranslation> {
    const skillId = typeof input.skillId === "string" ? input.skillId.trim() : "";
    if (!skillId) {
      throw new ApiError("Missing skill id.", 400);
    }
    const targetLanguage = typeof input.targetLanguage === "string" ? input.targetLanguage.trim() : "";
    if (!targetLanguage) {
      throw new ApiError("Missing target language.", 400);
    }
    const providerId = typeof input.providerId === "string" && input.providerId.trim() ? input.providerId.trim() : "openai";
    const detail = await this.getSkillDetail(skillId);
    let provider;
    try {
      provider = this.translationRegistry.get(providerId);
    } catch {
      throw new ApiError(`Translation provider not found: ${providerId}`, 400);
    }
    if (!provider.configured()) {
      throw new ApiError(
        `Translation provider is not configured: ${providerId}. Configure OPENAI_API_KEY on the server or use the desktop app.`,
        503
      );
    }
    const translation = await provider.translate({
      markdown: detail.content,
      targetLanguage
    });
    return { ...translation, skillId };
  }

  listInstallTargets(): InstallTarget[] {
    return [];
  }

  getInstallStatus(): InstallStatus[] {
    return [];
  }

  installSkills(): InstallResult {
    throw new ApiError("Web API does not install skills into local agent tools. Use the desktop app for local installation.", 400);
  }

  uninstallSkills(): InstallResult {
    throw new ApiError("Web API does not uninstall skills from local agent tools. Use the desktop app for local installation changes.", 400);
  }

  private async collectLibrarySources(): Promise<{ groups: SkillGroup[]; filesByGroup: Map<string, SkillFileSource[]> }> {
    await mkdir(this.reposDir, { recursive: true });
    const groups: SkillGroup[] = [
      {
        id: "local:workspace",
        name: "Local workspace",
        kind: "local",
        path: join(this.options.repoRoot, "skills")
      }
    ];
    const filesByGroup = new Map<string, SkillFileSource[]>();
    filesByGroup.set(groups[0].id, await readSkillSources(join(this.options.repoRoot, "skills")));

    const library = await this.loadStoredLibrary();
    for (const repository of library.repositories) {
      const normalized = this.normalizeStoredRepository(repository);
      const group: SkillGroup = {
        id: normalized.id,
        name: normalized.name,
        kind: normalized.source === "github-api" ? "github-api" : "web-cache",
        url: normalized.url,
        path: normalized.source === "server-cache" ? normalized.path : undefined,
        importedAt: normalized.importedAt,
        updatedAt: normalized.updatedAt
      };
      groups.push(group);
      filesByGroup.set(
        group.id,
        normalized.source === "github-api" ? await this.readGitHubApiSources(normalized.repoInfo) : await readSkillSources(normalized.path)
      );
    }

    return { groups, filesByGroup };
  }

  private async cloneOrPull(repo: GitHubRepoInfo): Promise<void> {
    await mkdir(this.reposDir, { recursive: true });
    const target = join(this.reposDir, repo.slug);
    try {
      await stat(join(target, ".git"));
      await runGit(["pull", "--ff-only"], target);
    } catch {
      await runGit(["clone", "--depth", "1", repo.cloneUrl, target]);
    }
  }

  private async readGitHubApiSources(repo: GitHubRepoInfo): Promise<SkillFileSource[]> {
    const defaultBranch = repo.defaultBranch ?? (await this.readGitHubDefaultBranch(repo));
    const tree = await githubJson<{ tree?: Array<{ path: string; type: string; sha: string }>; truncated?: boolean }>(
      `https://api.github.com/repos/${repo.owner}/${repo.repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`
    );
    if (tree.truncated) {
      throw new ApiError(
        "GitHub API returned a truncated repository tree. Use the server-cache source so Skills Manager can clone the repository and scan it locally.",
        502
      );
    }
    if (!Array.isArray(tree.tree)) {
      throw new ApiError("GitHub API repository tree response did not include a tree array.", 502);
    }
    const entries = tree.tree ?? [];
    const byPath = new Map(entries.map((entry) => [entry.path, entry]));
    const skillEntries = entries.filter((entry) => entry.type === "blob" && isSkillFilePath(entry.path));
    const sources: SkillFileSource[] = [];
    for (const entry of skillEntries) {
      const entryDir = dirname(entry.path);
      const manifestPath = entryDir === "." ? "skill.yaml" : `${entryDir}/skill.yaml`;
      sources.push({
        relativePath: entry.path,
        content: await readGitHubBlob(repo, entry.sha),
        manifestContent: byPath.has(manifestPath) ? await readGitHubBlob(repo, byPath.get(manifestPath)!.sha) : undefined
      });
    }
    return sources;
  }

  private async readGitHubDefaultBranch(repo: GitHubRepoInfo): Promise<string> {
    const metadata = await githubJson<{ default_branch?: string }>(`https://api.github.com/repos/${repo.owner}/${repo.repo}`);
    if (!metadata.default_branch) {
      throw new ApiError("GitHub repository metadata did not include a default branch.", 502);
    }
    return metadata.default_branch;
  }

  private async loadStoredLibrary(): Promise<StoredLibrary> {
    try {
      return JSON.parse(await readFile(this.libraryFile, "utf8")) as StoredLibrary;
    } catch {
      return { version: 1, repositories: [] };
    }
  }

  private async saveStoredLibrary(library: StoredLibrary): Promise<void> {
    await mkdir(dirname(this.libraryFile), { recursive: true });
    await writeFile(this.libraryFile, `${JSON.stringify(library, null, 2)}\n`, "utf8");
  }

  private normalizeStoredRepository(repository: StoredRepository): {
    id: string;
    name: string;
    url: string;
    source: "server-cache" | "github-api";
    path: string;
    importedAt?: string;
    updatedAt?: string;
    repoInfo: GitHubRepoInfo;
  } {
    const repoInfo = normalizeGitHubUrl(repository.url);
    const slug = repository.slug ?? repoInfo.slug;
    return {
      id: repository.id ?? repoInfo.id,
      name: repository.name ?? repoInfo.name,
      url: repository.url ?? repoInfo.url,
      source: repository.source ?? "server-cache",
      path: repository.path ?? join(this.reposDir, slug),
      importedAt: repository.importedAt ?? repository.imported_at,
      updatedAt: repository.updatedAt ?? repository.updated_at,
      repoInfo: { ...repoInfo, defaultBranch: repository.defaultBranch ?? repository.default_branch }
    };
  }
}

function isSkillFilePath(path: string): boolean {
  return path === "SKILL.md" || path.endsWith("/SKILL.md");
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
  }
}

export async function readSkillSources(root: string): Promise<SkillFileSource[]> {
  const files: SkillFileSource[] = [];
  await walk(root, async (file) => {
    if (!file.endsWith("/SKILL.md")) {
      return;
    }
    const relativePath = relative(root, file).split("\\").join("/");
    const manifestPath = file.replace(/SKILL\.md$/, "skill.yaml");
    files.push({
      relativePath,
      content: await readFile(file, "utf8"),
      manifestContent: await readOptionalFile(manifestPath),
      absolutePath: file
    });
  });
  return files;
}

export function normalizeGitHubUrl(input: string): GitHubRepoInfo {
  const trimmed = input.trim();
  const sshMatch = trimmed.match(/^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/);
  const sshUrlMatch = trimmed.match(/^ssh:\/\/git@github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/);
  if (sshMatch) {
    return githubRepoInfo(sshMatch[1], sshMatch[2], `git@github.com:${sshMatch[1]}/${sshMatch[2]}.git`);
  }
  if (sshUrlMatch) {
    return githubRepoInfo(sshUrlMatch[1], sshUrlMatch[2], `ssh://git@github.com/${sshUrlMatch[1]}/${sshUrlMatch[2]}.git`);
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new ApiError("Enter a valid GitHub repository URL.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.hostname.toLowerCase() !== "github.com") {
    throw new ApiError("Only GitHub repository URLs are supported.");
  }
  const [owner, rawRepo] = url.pathname.split("/").filter(Boolean);
  if (!owner || !rawRepo) {
    throw new ApiError("GitHub URL must include owner and repository.");
  }
  const repo = rawRepo.endsWith(".git") ? rawRepo.slice(0, -4) : rawRepo;
  return githubRepoInfo(owner, repo, `https://github.com/${owner}/${repo}.git`);
}

async function walk(directory: string, onFile: (file: string) => Promise<void>): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(directory);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.startsWith(".") || skipDirs.has(entry)) {
      continue;
    }
    const path = join(directory, entry);
    const fileStat = await stat(path);
    if (fileStat.isDirectory()) {
      await walk(path, onFile);
    } else {
      await onFile(path);
    }
  }
}

async function readOptionalFile(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return undefined;
  }
}

async function runGit(args: string[], cwd?: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd, timeout: 180_000 });
    return stdout.trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Git command failed.";
    throw new ApiError(message, 502);
  }
}

function githubRepoInfo(owner: string, repo: string, cloneUrl: string): GitHubRepoInfo {
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new ApiError("GitHub owner or repository name contains unsupported characters.");
  }
  return {
    id: `github:${owner}/${repo}`.toLowerCase(),
    name: `${owner}/${repo}`,
    owner,
    repo,
    slug: `${owner}--${repo}`.replace(/[^A-Za-z0-9_.-]+/g, "-").toLowerCase(),
    url: `https://github.com/${owner}/${repo}`,
    cloneUrl
  };
}

async function githubJson<T>(url: string): Promise<T> {
  const token = githubAuthToken();
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "skills-manager",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  const payload = (await response.json()) as unknown;
  if (!response.ok) {
    throw new ApiError(`GitHub API request failed: ${JSON.stringify(payload)}`, response.status);
  }
  return payload as T;
}

function githubAuthToken(): string | undefined {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;
}

async function readGitHubBlob(repo: GitHubRepoInfo, sha: string): Promise<string> {
  const blob = await githubJson<{ content: string; encoding: string }>(
    `https://api.github.com/repos/${repo.owner}/${repo.repo}/git/blobs/${sha}`
  );
  if (blob.encoding !== "base64") {
    throw new ApiError(`Unsupported GitHub blob encoding: ${blob.encoding}`, 502);
  }
  return Buffer.from(blob.content.replace(/\n/g, ""), "base64").toString("utf8");
}

function isPathInside(child: string, parent: string): boolean {
  const relativePath = relative(resolve(parent), resolve(child));
  return Boolean(relativePath) && !relativePath.startsWith("..") && !relativePath.startsWith("/");
}
