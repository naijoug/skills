import { useEffect, useRef, useState } from "react";
import type { TranslationProviderDescriptor } from "@skills-manager/core";
import type { SkillsAdapter } from "@skills-manager/platform";

export interface TranslatePanelProps {
  adapter: SkillsAdapter;
  skillId: string;
}

export function TranslatePanel({ adapter, skillId }: TranslatePanelProps) {
  const [targetLanguage, setTargetLanguage] = useState("Chinese");
  const [providerId, setProviderId] = useState("openai");
  const [providers, setProviders] = useState<TranslationProviderDescriptor[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [result, setResult] = useState("");
  const [busyAction, setBusyAction] = useState<"saving" | "translating" | "">("");
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
    translationRequestId.current += 1;
    setResult("");
    setBusyAction((current) => (current === "translating" ? "" : current));
  }, [skillId]);

  const selectedProvider = providers.find((provider) => provider.id === providerId);
  const canTranslate = Boolean(targetLanguage.trim()) && !busyAction;
  const canSaveProvider = Boolean(selectedProvider?.supportsConfiguration) && Boolean(apiKey.trim() || model.trim()) && !busyAction;

  async function saveProviderConfig(): Promise<void> {
    if (!canSaveProvider) {
      return;
    }
    setBusyAction("saving");
    setResult("Saving provider...");
    try {
      const nextProviders = await adapter.saveTranslationProviderConfig({
        providerId,
        apiKey: apiKey.trim() || undefined,
        model: model.trim() || undefined
      });
      setProviders(nextProviders);
      setApiKey("");
      setResult("Provider saved.");
    } catch (error) {
      setResult(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyAction((current) => (current === "saving" ? "" : current));
    }
  }

  async function translate(): Promise<void> {
    if (!canTranslate) {
      return;
    }
    const requestId = translationRequestId.current + 1;
    translationRequestId.current = requestId;
    setBusyAction("translating");
    setResult("Translating...");
    try {
      const translation = await adapter.translateSkill({ skillId, targetLanguage: targetLanguage.trim(), providerId });
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
      <h3>Translate</h3>
      <div className="skills-control-row">
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
      {selectedProvider?.supportsConfiguration ? (
        <div className="skills-control-row">
          <input
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="OpenAI API key"
            disabled={Boolean(busyAction)}
            type="password"
          />
          <input value={model} onChange={(event) => setModel(event.target.value)} placeholder="Model" disabled={Boolean(busyAction)} />
          <button type="button" onClick={saveProviderConfig} disabled={!canSaveProvider}>
            {busyAction === "saving" ? "Saving" : "Save provider"}
          </button>
        </div>
      ) : null}
      {result ? <pre>{result}</pre> : null}
    </section>
  );
}
