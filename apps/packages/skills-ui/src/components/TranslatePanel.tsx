import { useEffect, useRef, useState } from "react";
import type { SkillDetail, TranslationProviderDescriptor } from "@skills-manager/core";
import type { SkillsAdapter } from "@skills-manager/platform";
import type { TranslateSkillInput } from "@skills-manager/platform";

export interface TranslatePanelProps {
  adapter: SkillsAdapter;
  detail: SkillDetail;
  sourceMode: TranslationSourceMode;
}

export type TranslationSourceMode = "summary" | "markdown";

export function TranslatePanel({ adapter, detail, sourceMode }: TranslatePanelProps) {
  const [targetLanguage, setTargetLanguage] = useState("Chinese");
  const [providerId, setProviderId] = useState("openai");
  const [providers, setProviders] = useState<TranslationProviderDescriptor[]>([]);
  const [result, setResult] = useState("");
  const [busyAction, setBusyAction] = useState<"translating" | "">("");
  const providerRequestId = useRef(0);
  const translationRequestId = useRef(0);

  useEffect(() => {
    const requestId = providerRequestId.current + 1;
    providerRequestId.current = requestId;
    adapter
      .listTranslationProviders()
      .then((nextProviders) => {
        if (providerRequestId.current === requestId) {
          setProviders(nextProviders);
        }
      })
      .catch(() => {
        if (providerRequestId.current === requestId) {
          setProviders([]);
        }
      });
  }, [adapter]);

  useEffect(() => {
    if (providers.length && !providers.some((provider) => provider.id === providerId)) {
      setProviderId(providers[0].id);
    }
  }, [providerId, providers]);

  useEffect(() => {
    translationRequestId.current += 1;
    setResult("");
    setBusyAction((current) => (current === "translating" ? "" : current));
  }, [detail.id, sourceMode]);

  const selectedProvider = providers.find((provider) => provider.id === providerId);
  const sourceMarkdown = translationSourceMarkdown(detail, sourceMode);
  const sourceLabel = sourceMode === "summary" ? "summary" : "Markdown";
  const canTranslate = Boolean(targetLanguage.trim()) && !busyAction;

  async function translate(): Promise<void> {
    if (!canTranslate) {
      return;
    }
    const requestId = translationRequestId.current + 1;
    translationRequestId.current = requestId;
    setBusyAction("translating");
    setResult("Translating...");
    try {
      const translation = await adapter.translateSkill(buildTranslateSkillInput(detail, targetLanguage, providerId, sourceMode));
      if (translationRequestId.current !== requestId) {
        return;
      }
      setResult(translation.markdown);
    } catch (error) {
      if (translationRequestId.current !== requestId) {
        return;
      }
      setResult(error instanceof Error ? error.message : String(error));
    } finally {
      if (translationRequestId.current === requestId) {
        setBusyAction((current) => (current === "translating" ? "" : current));
      }
    }
  }

  return (
    <section className="skills-action-panel">
      <h3>Translate {sourceLabel}</h3>
      <div className="skills-control-row translate-controls">
        <select value={providerId} onChange={(event) => setProviderId(event.target.value)} disabled={Boolean(busyAction)}>
          {providers.length ? (
            providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.label}
                {provider.configured ? "" : " (not configured)"}
              </option>
            ))
          ) : (
            <option value="openai">OpenAI</option>
          )}
        </select>
        <input value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} disabled={Boolean(busyAction)} />
        <button type="button" onClick={translate} disabled={!canTranslate}>
          {busyAction === "translating" ? "Translating" : "Translate"}
        </button>
      </div>
      {selectedProvider?.configurationHint ? <p>{selectedProvider.configurationHint}</p> : null}
      {result ? (
        <div className="skills-translation-grid">
          <section>
            <h4>English source</h4>
            <pre>{sourceMarkdown}</pre>
          </section>
          <section>
            <h4>Translation</h4>
            <pre>{result}</pre>
          </section>
        </div>
      ) : null}
    </section>
  );
}

export function buildTranslateSkillInput(
  detail: SkillDetail,
  targetLanguage: string,
  providerId: string,
  sourceMode: TranslationSourceMode
): TranslateSkillInput {
  return {
    skillId: detail.id,
    targetLanguage: targetLanguage.trim(),
    providerId,
    sourceMode
  };
}

export function translationSourceMarkdown(detail: SkillDetail, sourceMode: TranslationSourceMode): string {
  if (sourceMode === "markdown") {
    return detail.content;
  }
  const parts = [`# ${detail.title}`];
  if (detail.description) {
    parts.push(detail.description);
  }
  const references = extractMarkdownSection(detail.content, "References");
  if (references) {
    parts.push(`## References\n\n${references}`);
  }
  return parts.join("\n\n");
}

function extractMarkdownSection(markdown: string, heading: string): string {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim().toLowerCase() === `## ${heading.toLowerCase()}`);
  if (start === -1) {
    return "";
  }
  const collected: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim().startsWith("## ")) {
      break;
    }
    collected.push(line);
  }
  return collected.join("\n").trim();
}
