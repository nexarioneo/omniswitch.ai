import type { ProviderAdapter } from "./types";
import { openaiAdapter } from "./openai";
import { anthropicAdapter } from "./anthropic";
import { googleAdapter } from "./google";
import { groqAdapter } from "./groq";
import { openrouterAdapter } from "./openrouter";
import { deepseekAdapter } from "./deepseek";

const adapters: Record<string, ProviderAdapter> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  google: googleAdapter,
  groq: groqAdapter,
  openrouter: openrouterAdapter,
  deepseek: deepseekAdapter,
};

export function getProviderAdapter(providerName: string): ProviderAdapter | null {
  return adapters[providerName] || null;
}

export { openaiAdapter, anthropicAdapter, googleAdapter, groqAdapter, openrouterAdapter, deepseekAdapter };
