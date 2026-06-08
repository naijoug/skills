import { spawn, type ExecFileOptions } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, isAbsolute, join } from "node:path";
import type { SkillTranslation } from "@skills-manager/core";
import type { TranslateMarkdownInput, TranslationProvider } from "./TranslationProvider";

export type ExecFileImpl = (file: string, args: string[], options: ExecFileOptions) => Promise<{ stdout: string | Buffer; stderr: string | Buffer }>;

export interface LocalAgentTranslationProviderOptions {
  commandAvailable?: (command: string) => boolean;
  execFileImpl?: ExecFileImpl;
  timeoutMs?: number;
}

interface LocalAgentProviderConfig {
  id: string;
  label: string;
  command: string;
  args(prompt: string, outputFile?: string): string[];
  configurationHint?: string;
  outputFile?: boolean;
}

class LocalAgentTranslationProvider implements TranslationProvider {
  readonly id: string;
  readonly label: string;
  readonly configurationHint: string;

  private readonly command: string;
  private readonly buildArgs: (prompt: string, outputFile?: string) => string[];
  private readonly outputFile: boolean;
  private readonly commandAvailable: (command: string) => boolean;
  private readonly execFileImpl: ExecFileImpl;
  private readonly timeoutMs: number;

  constructor(config: LocalAgentProviderConfig, options: LocalAgentTranslationProviderOptions = {}) {
    this.id = config.id;
    this.label = config.label;
    this.command = config.command;
    this.buildArgs = config.args;
    this.outputFile = Boolean(config.outputFile);
    this.configurationHint = config.configurationHint ?? `${config.label} uses the local ${config.command} command.`;
    this.commandAvailable = options.commandAvailable ?? commandExists;
    this.execFileImpl = options.execFileImpl ?? defaultExecFileImpl;
    this.timeoutMs = options.timeoutMs ?? 180_000;
  }

  configured(): boolean {
    return this.commandAvailable(this.command);
  }

  async translate(input: TranslateMarkdownInput): Promise<SkillTranslation> {
    if (!this.configured()) {
      throw new Error(`${this.label} translation provider is not configured.`);
    }
    const prompt = localAgentPrompt(input);
    const outputDir = this.outputFile ? await mkdtemp(join(tmpdir(), "skills-manager-translation-")) : "";
    const outputFile = outputDir ? join(outputDir, "last-message.md") : undefined;
    try {
      const result = await this.execFileImpl(this.command, this.buildArgs(prompt, outputFile), {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
        timeout: this.timeoutMs
      });
      const markdown = (String(result.stdout).trim() || (outputFile ? await readOutputFile(outputFile) : "")).trim();
      if (!markdown) {
        const stderr = String(result.stderr).trim();
        throw new Error(stderr || `${this.label} translation command returned no output.`);
      }
      return {
        providerId: this.id,
        targetLanguage: input.targetLanguage,
        markdown
      };
    } catch (error) {
      throw new Error(normalizeLocalAgentError(this.id, this.label, error));
    } finally {
      if (outputDir) {
        await rm(outputDir, { recursive: true, force: true });
      }
    }
  }
}

export class CodexTranslationProvider extends LocalAgentTranslationProvider {
  constructor(options: LocalAgentTranslationProviderOptions = {}) {
    super(
      {
        id: "codex",
        label: "Local Codex",
        command: "codex",
        configurationHint: "Uses local `codex exec` in read-only, ephemeral mode.",
        outputFile: true,
        args: (prompt, outputFile) => [
          "exec",
          "--skip-git-repo-check",
          "--ignore-rules",
          "-c",
          'model_reasoning_effort="low"',
          "--sandbox",
          "read-only",
          "--ephemeral",
          ...(outputFile ? ["--output-last-message", outputFile] : []),
          prompt
        ]
      },
      options
    );
  }
}

export class ClaudeCodeTranslationProvider extends LocalAgentTranslationProvider {
  constructor(options: LocalAgentTranslationProviderOptions = {}) {
    super(
      {
        id: "claude-code",
        label: "Local Claude Code",
        command: "claude",
        configurationHint: "Uses local `claude -p` with no session persistence.",
        args: (prompt) => ["-p", "--no-session-persistence", prompt]
      },
      options
    );
  }
}

export class AmpTranslationProvider extends LocalAgentTranslationProvider {
  constructor(options: LocalAgentTranslationProviderOptions = {}) {
    super(
      {
        id: "amp",
        label: "Local Amp",
        command: "amp",
        configurationHint: "Uses local `amp -x`; Amp execute mode requires paid credits for non-interactive translation.",
        args: (prompt) => ["--no-ide", "--no-notifications", "-x", prompt]
      },
      { ...options, timeoutMs: options.timeoutMs ?? 45_000 }
    );
  }
}

function localAgentPrompt(input: TranslateMarkdownInput): string {
  return [
    "You are a precise technical translator.",
    `Translate the Markdown skill documentation into ${input.targetLanguage}.`,
    "Preserve Markdown structure, fenced code blocks, YAML front matter keys, command names, paths, placeholders, and examples.",
    "Return only the translated Markdown.",
    "",
    "Markdown:",
    "",
    input.markdown
  ].join("\n");
}

function normalizeLocalAgentError(providerId: string, label: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (providerId !== "amp") {
    return message;
  }
  if (/paid credits|amp free|execute mode|402/i.test(message)) {
    return [
      `${label} is installed, but non-interactive translation uses \`amp -x\`, which requires Amp paid credits.`,
      "Add Amp paid credits or configure AMP_API_KEY for an account that supports execute mode, then retry."
    ].join(" ");
  }
  if (/certificate verification/i.test(message)) {
    return `${label} is installed, but Amp could not reach its service because certificate verification failed. Fix Amp network or certificate settings, then retry.`;
  }
  return message;
}

async function defaultExecFileImpl(file: string, args: string[], options: ExecFileOptions): Promise<{ stdout: string | Buffer; stderr: string | Buffer }> {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { stdio: ["pipe", "pipe", "pipe"] });
    const maxBuffer = options.maxBuffer ?? 10 * 1024 * 1024;
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeout = options.timeout
      ? setTimeout(() => {
          settled = true;
          child.kill();
          reject(new Error(`${file} timed out after ${options.timeout}ms`));
        }, options.timeout)
      : undefined;

    child.stdin.end();
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
      if (stdout.length + stderr.length > maxBuffer) {
        settled = true;
        child.kill();
        reject(new Error(`${file} exceeded max output buffer.`));
      }
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
      if (stdout.length + stderr.length > maxBuffer) {
        settled = true;
        child.kill();
        reject(new Error(`${file} exceeded max output buffer.`));
      }
    });
    child.on("error", (error) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    child.on("close", (code) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (settled) {
        return;
      }
      settled = true;
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const error = new Error(stderr.trim() || `${file} exited with status ${code ?? "unknown"}`);
        Object.assign(error, { stdout, stderr, code });
        reject(error);
      }
    });
  });
}

async function readOutputFile(path: string): Promise<string> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

function commandExists(command: string): boolean {
  if (command.includes("/") || isAbsolute(command)) {
    return isExecutable(command);
  }
  return (process.env.PATH ?? "").split(delimiter).some((directory) => isExecutable(join(directory, command)));
}

function isExecutable(path: string): boolean {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
