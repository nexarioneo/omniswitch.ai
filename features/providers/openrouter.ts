import type { ProviderAdapter, ProviderRequest, ProviderResponse } from "./types";

export const openrouterAdapter: ProviderAdapter = {
  normalizeRequest(openaiRequest: unknown): ProviderRequest {
    const req = openaiRequest as Record<string, unknown>;
    return {
      url: "/chat/completions",
      headers: { "Content-Type": "application/json" },
      body: req.stream ? { ...req, stream_options: { include_usage: true } } : req,
    };
  },

  normalizeCompletionRequest(openaiRequest: unknown): ProviderRequest {
    return {
      url: "/completions",
      headers: { "Content-Type": "application/json" },
      body: openaiRequest,
    };
  },

  normalizeResponse(providerResponse: ProviderResponse): unknown {
    return providerResponse.data;
  },

  normalizeStreamChunk(chunk: unknown): string | null {
    return JSON.stringify(chunk);
  },

  getAuthHeaders(key: string): Record<string, string> {
    return { Authorization: `Bearer ${key}` };
  },
};
