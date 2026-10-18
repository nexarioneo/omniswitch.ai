export interface ProviderRequest {
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface ProviderResponse {
  status: number;
  data: unknown;
}

export interface ProviderAdapter {
  normalizeRequest(openaiRequest: unknown): ProviderRequest;
  /** Optional: adapters for OpenAI-compatible providers also serve the legacy /completions endpoint. */
  normalizeCompletionRequest?(openaiRequest: unknown): ProviderRequest;
  normalizeResponse(providerResponse: ProviderResponse): unknown;
  normalizeStreamChunk(chunk: unknown): string | null;
  getAuthHeaders(key: string): Record<string, string>;
}
