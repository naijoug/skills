import { createServer, type IncomingMessage, type Server } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { ApiError, ApiManager } from "./apiManager";

export interface SkillsManagerServerOptions {
  manager?: ApiManager;
  repoRoot?: string;
  dataDir?: string;
  allowedOrigins?: string[];
}

export function createSkillsManagerServer(options: SkillsManagerServerOptions = {}): Server {
  const repoRoot = options.repoRoot ?? defaultRepoRoot();
  const dataDir = options.dataDir ?? process.env.SKILLS_MANAGER_DATA_DIR ?? join(repoRoot, ".skills-manager-data");
  const manager = options.manager ?? new ApiManager({ repoRoot, dataDir });

  const allowedOrigins = new Set(options.allowedOrigins ?? (
    process.env.SKILLS_MANAGER_ALLOWED_ORIGINS ?? "http://127.0.0.1:5173,http://localhost:5173"
  ).split(",").map((origin) => origin.trim()).filter(Boolean));
  for (const origin of allowedOrigins) {
    const url = new URL(origin);
    if (url.protocol !== "http:" || !isLoopbackHost(url.hostname) || url.origin !== origin) {
      throw new Error("Allowed origins must be explicit HTTP loopback origins.");
    }
  }

  return createServer({ requestTimeout: 10_000, headersTimeout: 10_000 }, async (request, response) => {
    const headers: Record<string, string> = {
      "Vary": "Origin",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    try {
      const peer = request.socket.remoteAddress;
      if (!peer || !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(peer)) {
        throw new ApiError("Only local clients are allowed.", 403);
      }
      const host = request.headers.host;
      if (!host || !isLoopbackHost(new URL(`http://${host}`).hostname)) {
        throw new ApiError("Invalid local Host header.", 403);
      }
      const origin = request.headers.origin;
      if (origin && !allowedOrigins.has(origin)) {
        throw new ApiError("Origin is not allowed.", 403);
      }
      if (origin) headers["Access-Control-Allow-Origin"] = origin;
      if (request.method === "OPTIONS") {
        response.writeHead(204, headers);
        response.end();
        return;
      }
      const url = new URL(request.url ?? "/", `http://${host}`);
      const expectedMethod = routeMethods[url.pathname];
      if (!expectedMethod) throw new ApiError("Not found.", 404);
      if (request.method !== expectedMethod) {
        headers.Allow = expectedMethod;
        throw new ApiError("Method not allowed.", 405);
      }
      if (expectedMethod === "POST" && request.headers["content-type"]?.split(";")[0].trim().toLowerCase() !== "application/json") {
        throw new ApiError("Content-Type must be application/json.", 415);
      }
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
  if (!["127.0.0.1", "::1"].includes(host)) {
    throw new Error("Skills Manager is a local API; SKILLS_MANAGER_API_HOST must be 127.0.0.1 or ::1.");
  }
  const server = createSkillsManagerServer();
  server.listen(port, host, () => {
    console.log(`Skills Manager API listening on http://${host}:${port}`);
  });
  return server;
}

const routeMethods: Record<string, "GET" | "POST"> = {
  "/health": "GET",
  "/api/library": "GET",
  "/api/repositories": "POST",
  "/api/repositories/remove": "POST",
  "/api/refresh": "POST",
  "/api/skills/detail": "GET",
  "/api/translation/providers": "GET",
  "/api/translation/providers/config": "POST",
  "/api/translate": "POST",
  "/api/install/targets": "GET",
  "/api/install/status": "POST",
  "/api/install": "POST",
  "/api/uninstall": "POST"
};

function isLoopbackHost(host: string): boolean {
  return ["127.0.0.1", "localhost", "[::1]"].includes(host);
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
  const limit = 64 * 1024;
  if (Number(request.headers["content-length"] ?? 0) > limit) {
    throw new ApiError("Request body exceeds 64 KiB.", 413);
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    size += buffer.length;
    if (size <= limit) chunks.push(buffer);
  }
  if (size > limit) throw new ApiError("Request body exceeds 64 KiB.", 413);
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
