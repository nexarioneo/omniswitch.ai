import type { ProviderAdapter, ProviderRequest } from "../providers/types";
import { shouldRetry, getRetryDelay, sleep } from "./retry";
import { logUsage } from "../data/usage";
import { formatSSE, formatSSEDone } from "./stream";

const MAX_RETRIES = 3;
const encoder = new TextEncoder();

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

const EMPTY_USAGE: Usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
const EMPTY_USAGE_FIELDS = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

export function jsonError(message: string, type: string, status: number): Response {
  return Response.json({ error: { message, type } }, { status });
}

function pickUsage(chunk: unknown, current: Usage): Usage {
  const record = chunk as {
    usage?: Record<string, number>;
    usageMetadata?: Record<string, number>;
  } | null;
  if (!record) return current;

  const source = record.usage ?? record.usageMetadata;
  if (!source) return current;

  const prompt = source.prompt_tokens ?? source.input_tokens ?? source.promptTokenCount;
  const completion = source.completion_tokens ?? source.output_tokens ?? source.candidatesTokenCount;
  const total = source.total_tokens ?? source.totalTokenCount;

  const promptTokens = prompt ?? current.prompt_tokens;
  const completionTokens = completion ?? current.completion_tokens;

  return {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: total ?? promptTokens + completionTokens,
  };
}

export async function executeProviderRequest(args: {
  url: string;
  headers: Record<string, string>;
  body: unknown;
  adapter: ProviderAdapter;
  apiKeyId: number;
  providerId: number;
  model: string;
  stream: boolean;
}): Promise<Response> {
  const startTime = Date.now();
  let response: Response | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      response = await fetch(args.url, {
        method: "POST",
        headers: args.headers,
        body: JSON.stringify(args.body),
      });
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        logUsage({
          apiKeyId: args.apiKeyId,
          providerId: args.providerId,
          model: args.model,
          ...EMPTY_USAGE_FIELDS,
          latencyMs: Date.now() - startTime,
          status: "error",
          errorMessage: String(err),
        });
        return jsonError("Provider request failed", "server_error", 502);
      }
      await sleep(getRetryDelay(attempt));
      continue;
    }

    if (response.ok) break;

    if (!shouldRetry(response.status, attempt)) {
      const errorMessage = await response.text().catch(() => "");
      logUsage({
        apiKeyId: args.apiKeyId,
        providerId: args.providerId,
        model: args.model,
        ...EMPTY_USAGE_FIELDS,
        latencyMs: Date.now() - startTime,
        status: "error",
        errorMessage: errorMessage.slice(0, 1000),
      });
      return jsonError(`Provider error: ${response.status}`, "server_error", response.status);
    }

    await response.body?.cancel().catch(() => {});
    await sleep(getRetryDelay(attempt));
  }

  if (!response || !response.ok) {
    logUsage({
      apiKeyId: args.apiKeyId,
      providerId: args.providerId,
      model: args.model,
      ...EMPTY_USAGE_FIELDS,
      latencyMs: Date.now() - startTime,
      status: "error",
      errorMessage: "Max retries exceeded",
    });
    return jsonError("Max retries exceeded", "server_error", 502);
  }

  if (!args.stream) {
    const data = await response.json().catch(() => null);
    if (!data) {
      logUsage({
        apiKeyId: args.apiKeyId,
        providerId: args.providerId,
        model: args.model,
        ...EMPTY_USAGE_FIELDS,
        latencyMs: Date.now() - startTime,
        status: "error",
        errorMessage: "Invalid provider response",
      });
      return jsonError("Invalid provider response", "server_error", 502);
    }

    const normalized = args.adapter.normalizeResponse({ status: response.status, data });
    const usage = (normalized as { usage?: Partial<Usage> })?.usage;

    logUsage({
      apiKeyId: args.apiKeyId,
      providerId: args.providerId,
      model: args.model,
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
      latencyMs: Date.now() - startTime,
      status: "success",
    });

    return Response.json(normalized);
  }

  if (!response.body) {
    logUsage({
      apiKeyId: args.apiKeyId,
      providerId: args.providerId,
      model: args.model,
      ...EMPTY_USAGE_FIELDS,
      latencyMs: Date.now() - startTime,
      status: "error",
      errorMessage: "Empty provider response",
    });
    return jsonError("Empty provider response", "server_error", 502);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let usage: Usage = { ...EMPTY_USAGE };
  let failed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (text: string) => controller.enqueue(encoder.encode(text));
      let buffer = "";

      const handleLine = (line: string): boolean => {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) return false;

        const payload = trimmed.slice(5).trim();
        if (!payload) return false;
        if (payload === "[DONE]") return true;

        try {
          const chunk = JSON.parse(payload);
          usage = pickUsage(chunk, usage);
          const normalized = args.adapter.normalizeStreamChunk(chunk);
          if (normalized) push(formatSSE(normalized));
        } catch {
          // Ignore malformed provider chunks.
        }
        return false;
      };

      try {
        let finished = false;
        while (!finished) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (handleLine(line)) {
              finished = true;
              break;
            }
          }
        }

        if (!finished && buffer.trim()) {
          handleLine(buffer.replace(/\r$/, ""));
        }

        push(formatSSEDone());
        controller.close();
      } catch (err) {
        failed = true;
        push(formatSSE(JSON.stringify({ error: { message: String(err), type: "server_error" } })));
        push(formatSSEDone());
        controller.close();
      } finally {
        logUsage({
          apiKeyId: args.apiKeyId,
          providerId: args.providerId,
          model: args.model,
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          latencyMs: Date.now() - startTime,
          status: failed ? "error" : "success",
          errorMessage: failed ? "Stream interrupted" : undefined,
        });
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export function estimateTokens(request: unknown): number {
  return Math.ceil(JSON.stringify(request).length / 4);
}

export function prepareProviderRequest(
  adapter: ProviderAdapter,
  request: unknown,
  kind: "chat" | "completions" = "chat"
): { url: string; headers: Record<string, string>; body: unknown } | null {
  try {
    const normalize =
      kind === "completions" ? adapter.normalizeCompletionRequest : adapter.normalizeRequest;
    if (!normalize) return null;

    const providerRequest: ProviderRequest = normalize.call(adapter, request);
    return {
      url: providerRequest.url,
      headers: providerRequest.headers,
      body: providerRequest.body,
    };
  } catch {
    return null;
  }
}
