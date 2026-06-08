import { createServer, type IncomingMessage, type Server } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { ApiError, ApiManager } from "./apiManager";

export interface SkillsManagerServerOptions {
  manager?: ApiManager;
  repoRoot?: string;
  dataDir?: string;
}

export function createSkillsManagerServer(options: SkillsManagerServerOptions = {}): Server {
  const repoRoot = options.repoRoot ?? defaultRepoRoot();
  const dataDir = options.dataDir ?? process.env.SKILLS_MANAGER_DATA_DIR ?? join(repoRoot, ".skills-manager-data");
  const manager = options.manager ?? new ApiManager({ repoRoot, dataDir });

  return createServer(async (request, response) => {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      response.writeHead(204, headers);
      response.end();
      return;
    }

    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
      const body = request.method === "POST" ? await readJsonBody(request) : {};
      const result = await route(url, body, manager);
      response.writeHead(200, headers);
      response.end(JSON.stringify(result));
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      const message = error instanceof Error ? error.message : "Internal server error";
      response.writeHead(status, headers);
      response.end(JSON.stringify({ error: message }));
    }
  });
}

export function startSkillsManagerServer(): Server {
  const port = Number(process.env.SKILLS_MANAGER_API_PORT ?? 8787);
  const host = process.env.SKILLS_MANAGER_API_HOST ?? "127.0.0.1";
  const server = createSkillsManagerServer();
  server.listen(port, host, () => {
    console.log(`Skills Manager API listening on http://${host}:${port}`);
  });
  return server;
}

async function route(url: URL, body: unknown, manager: ApiManager): Promise<unknown> {
  if (url.pathname === "/health") {
    return { ok: true };
  }
  if (url.pathname === "/api/library") {
    return manager.listLibrary();
  }
  if (url.pathname === "/api/repositories") {
    return manager.importRepository(asObject(body) as { url: string; source?: "server-cache" | "github-api" });
  }
  if (url.pathname === "/api/repositories/remove") {
    return manager.removeRepository(asObject(body) as { repositoryId: string });
  }
  if (url.pathname === "/api/refresh") {
    return manager.refreshRepositories();
  }
  if (url.pathname === "/api/skills/detail") {
    const id = url.searchParams.get("id");
    if (!id) {
      throw new ApiError("Missing skill id.");
    }
    return manager.getSkillDetail(id);
  }
  if (url.pathname === "/api/translation/providers") {
    return manager.listTranslationProviders();
  }
  if (url.pathname === "/api/translation/providers/config") {
    return manager.saveTranslationProviderConfig();
  }
  if (url.pathname === "/api/translate") {
    return manager.translateSkill(asObject(body) as { skillId: string; targetLanguage: string; providerId?: string; sourceMode?: "summary" | "markdown" });
  }
  if (url.pathname === "/api/install/targets") {
    return manager.listInstallTargets();
  }
  if (url.pathname === "/api/install/status") {
    return manager.getInstallStatus();
  }
  if (url.pathname === "/api/install") {
    return manager.installSkills();
  }
  if (url.pathname === "/api/uninstall") {
    return manager.uninstallSkills();
  }
  throw new ApiError("Not found.", 404);
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError("Invalid JSON body.", 400);
  }
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError("Expected JSON object body.");
  }
  return value as Record<string, unknown>;
}

function defaultRepoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../../..");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startSkillsManagerServer();
}
