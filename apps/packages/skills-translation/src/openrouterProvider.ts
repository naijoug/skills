import type { SkillTranslation } from "@skills-manager/core";
import type { TranslateMarkdownInput, TranslationProvider } from "./TranslationProvider";

export interface OpenRouterTranslationProviderOptions {
  apiKey?: string;
  model?: string;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class OpenRouterTranslationProvider implements TranslationProvider {
  readonly id = "openrouter";
  readonly label = "OpenRouter";
  readonly supportsConfiguration = true;
  readonly configurationHint = "Use OPENROUTER_API_KEY or save an OpenRouter key in Desktop mode.";

  private readonly apiKey?: string;
  private readonly model: string;
  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

  constructor(options: OpenRouterTranslationProviderOptions = {}) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? "openai/gpt-5";
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 500;
  }

  configured(): boolean {
    return Boolean(this.apiKey);
  }

  async translate(input: TranslateMarkdownInput): Promise<SkillTranslation> {
    if (!this.apiKey) {
      throw new Error("OpenRouter translation provider is not configured.");
    }

    const response = await fetchWithRetry(
      this.fetchImpl,
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: [
                "You are a precise technical translator.",
                `Translate the Markdown skill documentation into ${input.targetLanguage}.`,
                "Preserve Markdown structure, fenced code blocks, YAML front matter keys, command names, paths, placeholders, and examples.",
                "Return only the translated Markdown."
              ].join(" ")
            },
            { role: "user", content: input.markdown }
          ]
        })
      },
      this.maxRetries,
      this.retryDelayMs
    );

    const payload = (await response.json()) as unknown;
    if (!response.ok) {
      throw new Error(`OpenRouter translation failed: ${JSON.stringify(payload)}`);
    }

    return {
      providerId: this.id,
      targetLanguage: input.targetLanguage,
      markdown: extractChatCompletionText(payload).trim(),
      model: this.model
    };
  }
}

async function fetchWithRetry(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  maxRetries: number,
  retryDelayMs: number
): Promise<Response> {
  let lastError: unknown;
  const attempts = Math.max(1, maxRetries);
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchImpl(url, init);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await delay(retryDelayMs * attempt);
      }
    }
  }
  throw new Error(`OpenRouter request failed: ${formatError(lastError)}`);
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error && error.cause ? String(error.cause) : "";
  return cause ? `${message}: ${cause}` : message;
}

function extractChatCompletionText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }
  const record = payload as Record<string, unknown>;
  const choices = Array.isArray(record.choices) ? record.choices : [];
  return choices
    .map((choice) => {
      if (!choice || typeof choice !== "object") {
        return "";
      }
      const message = (choice as Record<string, unknown>).message;
      if (!message || typeof message !== "object") {
        return "";
      }
      const content = (message as Record<string, unknown>).content;
      return typeof content === "string" ? content : "";
    })
    .filter(Boolean)
    .join("\n");
}
