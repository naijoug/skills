import type { TranslationProvider } from "./TranslationProvider";
import type { TranslationProviderDescriptor } from "@skills-manager/core";

export class TranslationProviderRegistry {
  private readonly providers = new Map<string, TranslationProvider>();

  register(provider: TranslationProvider): void {
    this.providers.set(provider.id, provider);
  }

  list(): TranslationProvider[] {
    return [...this.providers.values()];
  }

  listProviders(): TranslationProviderDescriptor[] {
    return this.list().map((provider) => ({
      id: provider.id,
      label: provider.label,
      configured: provider.configured()
    }));
  }

  get(providerId: string): TranslationProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Translation provider not found: ${providerId}`);
    }
    return provider;
  }
}
