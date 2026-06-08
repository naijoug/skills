import { describe, expect, it, vi } from "vitest";
import {
  AmpTranslationProvider,
  ClaudeCodeTranslationProvider,
  CodexTranslationProvider,
  OpenAITranslationProvider,
  OpenRouterTranslationProvider,
  TranslationProviderRegistry
} from "../src";

describe("translation providers", () => {
  it("lists configured provider descriptors", () => {
    const registry = new TranslationProviderRegistry();
    registry.register(new OpenAITranslationProvider({ apiKey: "test-key", fetchImpl: vi.fn() as never }));

    expect(registry.listProviders()).toEqual([
      {
        id: "openai",
        label: "OpenAI",
        configured: true,
        supportsConfiguration: true,
        configurationHint: expect.stringContaining("OpenAI")
      }
    ]);
  });

  it("calls the OpenAI Responses API and extracts translated markdown", async () => {
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init?.body as string);
      expect(body.instructions).toContain("Chinese");
      expect(body.input).toBe("# Hello");
      return new Response(
        JSON.stringify({
          output: [{ content: [{ type: "output_text", text: "# 你好" }] }]
        }),
        { status: 200 }
      );
    });
    const provider = new OpenAITranslationProvider({ apiKey: "test-key", model: "test-model", fetchImpl: fetchImpl as never });

    await expect(provider.translate({ markdown: "# Hello", targetLanguage: "Chinese" })).resolves.toEqual({
      providerId: "openai",
      targetLanguage: "Chinese",
      markdown: "# 你好",
      model: "test-model"
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.openai.com/v1/responses",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" })
      })
    );
  });

  it("fails clearly when OpenAI is not configured", async () => {
    const provider = new OpenAITranslationProvider({ fetchImpl: vi.fn() as never });

    await expect(provider.translate({ markdown: "# Hello", targetLanguage: "Chinese" })).rejects.toThrow("not configured");
  });

  it("calls the OpenRouter chat completions API and extracts translated markdown", async () => {
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init?.body as string);
      expect(body.messages[0].content).toContain("Chinese");
      expect(body.messages[1].content).toBe("# Hello");
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "# 你好" } }]
        }),
        { status: 200 }
      );
    });
    const provider = new OpenRouterTranslationProvider({ apiKey: "test-key", model: "openai/test-model", fetchImpl: fetchImpl as never });

    await expect(provider.translate({ markdown: "# Hello", targetLanguage: "Chinese" })).resolves.toEqual({
      providerId: "openrouter",
      targetLanguage: "Chinese",
      markdown: "# 你好",
      model: "openai/test-model"
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" })
      })
    );
  });

  it("retries transient OpenRouter fetch failures", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error("fetch failed", { cause: new Error("TLS handshake failed") }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "# 你好" } }]
          }),
          { status: 200 }
        )
      );
    const provider = new OpenRouterTranslationProvider({
      apiKey: "test-key",
      model: "openai/test-model",
      fetchImpl: fetchImpl as never,
      retryDelayMs: 0
    });

    await expect(provider.translate({ markdown: "# Hello", targetLanguage: "Chinese" })).resolves.toMatchObject({
      providerId: "openrouter",
      markdown: "# 你好"
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("calls local agent CLIs in non-interactive translation mode", async () => {
    const providers = [
      {
        provider: CodexTranslationProvider,
        command: "codex",
        prefix: ["exec", "--skip-git-repo-check", "--ignore-rules", "-c", 'model_reasoning_effort="low"', "--sandbox", "read-only", "--ephemeral"]
      },
      {
        provider: ClaudeCodeTranslationProvider,
        command: "claude",
        prefix: ["-p", "--no-session-persistence"]
      },
      {
        provider: AmpTranslationProvider,
        command: "amp",
        prefix: ["--no-ide", "--no-notifications", "-x"]
      }
    ];

    for (const entry of providers) {
      const execFileImpl = vi.fn(async () => ({ stdout: "# 你好\n", stderr: "" }));
      const provider = new entry.provider({ commandAvailable: () => true, execFileImpl: execFileImpl as never });

      await expect(provider.translate({ markdown: "# Hello", targetLanguage: "Chinese" })).resolves.toMatchObject({
        providerId: provider.id,
        targetLanguage: "Chinese",
        markdown: "# 你好"
      });

      expect(execFileImpl).toHaveBeenCalledOnce();
      const [file, args, options] = execFileImpl.mock.calls[0];
      expect(file).toBe(entry.command);
      expect(args.slice(0, entry.prefix.length)).toEqual(entry.prefix);
      expect(args.at(-1)).toContain("# Hello");
      expect(args.at(-1)).toContain("Chinese");
      expect(options.timeout).toBeGreaterThan(0);
    }
  });

  it("fails clearly when a local agent CLI is unavailable", async () => {
    const provider = new CodexTranslationProvider({ commandAvailable: () => false, execFileImpl: vi.fn() as never });

    expect(provider.configured()).toBe(false);
    await expect(provider.translate({ markdown: "# Hello", targetLanguage: "Chinese" })).rejects.toThrow("not configured");
  });

  it("explains when Amp execute mode requires paid credits", async () => {
    const provider = new AmpTranslationProvider({
      commandAvailable: () => true,
      execFileImpl: vi.fn(async () => ({
        stdout: "",
        stderr:
          'Error: 402 {"type":"error","error":{"message":"Execute mode (amp -x) and the Amp SDK require paid credits and cannot use Amp Free in non-interactive contexts."}}'
      })) as never
    });

    await expect(provider.translate({ markdown: "# Hello", targetLanguage: "Chinese" })).rejects.toThrow(
      "non-interactive translation uses `amp -x`, which requires Amp paid credits"
    );
  });

  it("explains when Amp certificate verification fails", async () => {
    const provider = new AmpTranslationProvider({
      commandAvailable: () => true,
      execFileImpl: vi.fn(async () => {
        throw new Error("Error: unknown certificate verification error");
      }) as never
    });

    await expect(provider.translate({ markdown: "# Hello", targetLanguage: "Chinese" })).rejects.toThrow(
      "certificate verification failed"
    );
  });
});
