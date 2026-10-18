import type { ProviderAdapter, ProviderRequest, ProviderResponse } from "./types";
import { generateId, getCurrentTimestamp } from "../gateway/normalize";

interface AnthropicMessage {
  role: string;
  content: string;
}

export const anthropicAdapter: ProviderAdapter = {
  normalizeRequest(openaiRequest: unknown): ProviderRequest {
    const req = openaiRequest as {
      model: string;
      messages: AnthropicMessage[];
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      stream?: boolean;
    };

    const system = req.messages.filter((m) => m.role === "system");
    const messages = req.messages.filter((m) => m.role !== "system");

    return {
      url: "/messages",
      headers: { "Content-Type": "application/json" },
      body: {
        model: req.model,
        messages,
        system: system.map((m) => m.content).join("\n"),
        max_tokens: req.max_tokens || 4096,
        temperature: req.temperature,
        top_p: req.top_p,
        stream: req.stream,
      },
    };
  },

  normalizeResponse(providerResponse: ProviderResponse): unknown {
    const data = providerResponse.data as {
      id: string;
      content: Array<{ type: string; text: string }>;
      usage: { input_tokens: number; output_tokens: number };
      stop_reason: string;
    };

    const text = data.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");

    return {
      id: generateId(),
      object: "chat.completion",
      created: getCurrentTimestamp(),
      model: data.id,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: text },
          finish_reason: data.stop_reason === "end_turn" ? "stop" : data.stop_reason,
        },
      ],
      usage: {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  },

  normalizeStreamChunk(chunk: unknown): string | null {
    const c = chunk as { type: string; delta?: { text?: string }; message?: { id: string } };
    if (c.type === "content_block_delta" && c.delta?.text) {
      return JSON.stringify({
        id: generateId(),
        object: "chat.completion.chunk",
        created: getCurrentTimestamp(),
        choices: [{ index: 0, delta: { content: c.delta.text }, finish_reason: null }],
      });
    }
    return null;
  },

  getAuthHeaders(key: string): Record<string, string> {
    return { "x-api-key": key, "anthropic-version": "2023-06-01" };
  },
};
