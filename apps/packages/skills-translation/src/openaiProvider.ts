import type { SkillTranslation } from "@skills-manager/core";
import type { TranslateMarkdownInput, TranslationProvider } from "./TranslationProvider";

export interface OpenAITranslationProviderOptions {
  apiKey?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

export class OpenAITranslationProvider implements TranslationProvider {
  readonly id = "openai";
  readonly label = "OpenAI";
  readonly supportsConfiguration = true;
  readonly configurationHint = "Use OPENAI_API_KEY or save an OpenAI key in Desktop mode.";

  private readonly apiKey?: string;
  private readonly model: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OpenAITranslationProviderOptions = {}) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? "gpt-5";
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  configured(): boolean {
    return Boolean(this.apiKey);
  }

  async translate(input: TranslateMarkdownInput): Promise<SkillTranslation> {
    if (!this.apiKey) {
      throw new Error("OpenAI translation provider is not configured.");
    }

    const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        instructions: [
          "You are a precise technical translator.",
          `Translate the Markdown skill documentation into ${input.targetLanguage}.`,
          "Preserve Markdown structure, fenced code blocks, YAML front matter keys, command names, paths, placeholders, and examples.",
          "Return only the translated Markdown."
        ].join(" "),
        input: input.markdown,
        max_output_tokens: 8000
      })
    });

    const payload = (await response.json()) as unknown;
    if (!response.ok) {
      throw new Error(`OpenAI translation failed: ${JSON.stringify(payload)}`);
    }

    return {
      providerId: this.id,
      targetLanguage: input.targetLanguage,
      markdown: extractResponseText(payload).trim(),
      model: this.model
    };
  }
}

function extractResponseText(payload: unknown): string {
  if (Array.isArray(payload)) {
    return payload.map(extractResponseText).filter(Boolean).join("\n");
  }
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (record.type === "output_text" && typeof record.text === "string") {
      return record.text;
    }
    return Object.values(record).map(extractResponseText).filter(Boolean).join("\n");
  }
  return "";
}
