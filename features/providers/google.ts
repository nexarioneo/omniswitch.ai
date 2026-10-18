import type { ProviderAdapter, ProviderRequest, ProviderResponse } from "./types";
import { generateId, getCurrentTimestamp } from "../gateway/normalize";

interface GoogleMessage {
  role: string;
  content: string;
}

export const googleAdapter: ProviderAdapter = {
  normalizeRequest(openaiRequest: unknown): ProviderRequest {
    const req = openaiRequest as {
      model: string;
      messages: GoogleMessage[];
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      stream?: boolean;
    };

    const system = req.messages.filter((m) => m.role === "system");
    const messages = req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    return {
      url: req.stream
        ? `/models/${req.model}:streamGenerateContent?alt=sse`
        : `/models/${req.model}:generateContent`,
      headers: { "Content-Type": "application/json" },
      body: {
        contents: messages,
        systemInstruction: system.length > 0 ? { parts: [{ text: system.map((m) => m.content).join("\n") }] } : undefined,
        generationConfig: {
          temperature: req.temperature,
          topP: req.top_p,
          maxOutputTokens: req.max_tokens,
        },
      },
    };
  },

  normalizeResponse(providerResponse: ProviderResponse): unknown {
    const data = providerResponse.data as {
      candidates: Array<{
        content: { parts: Array<{ text: string }> };
        finishReason: string;
      }>;
      usageMetadata: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
      };
    };

    const text = data.candidates[0]?.content.parts.map((p) => p.text).join("") || "";

    return {
      id: generateId(),
      object: "chat.completion",
      created: getCurrentTimestamp(),
      model: "google",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: text },
          finish_reason: data.candidates[0]?.finishReason === "STOP" ? "stop" : null,
        },
      ],
      usage: {
        prompt_tokens: data.usageMetadata.promptTokenCount,
        completion_tokens: data.usageMetadata.candidatesTokenCount,
        total_tokens: data.usageMetadata.totalTokenCount,
      },
    };
  },

  normalizeStreamChunk(chunk: unknown): string | null {
    const c = chunk as {
      candidates?: Array<{ content: { parts: Array<{ text: string }> }; finishReason: string }>;
    };
    const text = c.candidates?.[0]?.content.parts.map((p) => p.text).join("");
    if (text) {
      return JSON.stringify({
        id: generateId(),
        object: "chat.completion.chunk",
        created: getCurrentTimestamp(),
        choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
      });
    }
    return null;
  },

  getAuthHeaders(key: string): Record<string, string> {
    return { "x-goog-api-key": key };
  },
};
