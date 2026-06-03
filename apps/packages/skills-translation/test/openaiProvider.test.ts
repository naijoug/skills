import { describe, expect, it, vi } from "vitest";
import { OpenAITranslationProvider, TranslationProviderRegistry } from "../src";

describe("translation providers", () => {
  it("lists configured provider descriptors", () => {
    const registry = new TranslationProviderRegistry();
    registry.register(new OpenAITranslationProvider({ apiKey: "test-key", fetchImpl: vi.fn() as never }));

    expect(registry.listProviders()).toEqual([{ id: "openai", label: "OpenAI", configured: true }]);
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
});
