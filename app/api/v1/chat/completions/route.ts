import { NextRequest } from "next/server";
import { authenticateRequest } from "@/features/gateway/auth";
import { checkRateLimit } from "@/features/gateway/rate-limit";
import { routeModel } from "@/features/gateway/router";
import { selectProviderKey } from "@/features/gateway/key-rotator";
import { getProviderAdapter } from "@/features/providers";
import { chatCompletionSchema } from "@/lib/validate";
import {
  estimateTokens,
  executeProviderRequest,
  jsonError,
  prepareProviderRequest,
} from "@/features/gateway/execute";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const apiKey = authenticateRequest(request.headers.get("authorization"));
  if (!apiKey) {
    return jsonError("Invalid or missing API key", "invalid_request_error", 401);
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return jsonError("Invalid JSON body", "invalid_request_error", 400);
  }

  const parsed = chatCompletionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.message, "invalid_request_error", 400);
  }

  const route = routeModel(parsed.data.model);
  if (!route) {
    return jsonError(`Model '${parsed.data.model}' not found`, "invalid_request_error", 404);
  }

  const rateLimit = checkRateLimit(apiKey, estimateTokens(parsed.data));
  if (!rateLimit.allowed) {
    return jsonError("Rate limit exceeded", "rate_limit_error", 429);
  }

  const providerKey = selectProviderKey(route.provider.id);
  if (!providerKey) {
    return jsonError("No provider keys available", "server_error", 503);
  }

  const adapter = getProviderAdapter(route.provider.name);
  if (!adapter) {
    return jsonError("Provider adapter not found", "server_error", 500);
  }

  const providerRequest = prepareProviderRequest(adapter, parsed.data);
  if (!providerRequest) {
    return jsonError("Provider does not support this request", "invalid_request_error", 400);
  }

  const stream = Boolean(parsed.data.stream);
  const providerBody = stream
    ? { ...(providerRequest.body as Record<string, unknown>), stream: true }
    : providerRequest.body;

  return executeProviderRequest({
    url: `${route.provider.base_url}${providerRequest.url}`,
    headers: { ...providerRequest.headers, ...adapter.getAuthHeaders(providerKey.key) },
    body: providerBody,
    adapter,
    apiKeyId: apiKey.id,
    providerId: route.provider.id,
    model: parsed.data.model,
    stream,
  });
}
