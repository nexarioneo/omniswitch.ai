import { getDb } from "./db";

export interface UsageLog {
  id: number;
  api_key_id: number | null;
  provider_id: number | null;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export function logUsage(entry: {
  apiKeyId?: number;
  providerId?: number;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs?: number;
  status: string;
  errorMessage?: string;
}): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO usage_logs (api_key_id, provider_id, model, prompt_tokens, completion_tokens, total_tokens, latency_ms, status, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    entry.apiKeyId ?? null,
    entry.providerId ?? null,
    entry.model,
    entry.promptTokens,
    entry.completionTokens,
    entry.totalTokens,
    entry.latencyMs ?? null,
    entry.status,
    entry.errorMessage ?? null
  );
}

export function listUsageLogs(limit: number = 100): UsageLog[] {
  const db = getDb();
  return db.prepare("SELECT * FROM usage_logs ORDER BY created_at DESC, id DESC LIMIT ?").all(limit) as UsageLog[];
}

export function getUsageStats(): {
  totalRequests: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  avgLatency: number;
  successRate: number;
} {
  const db = getDb();
  const row = db.prepare(
    `SELECT
      COUNT(*) as total_requests,
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(prompt_tokens), 0) as total_prompt_tokens,
      COALESCE(SUM(completion_tokens), 0) as total_completion_tokens,
      COALESCE(AVG(latency_ms), 0) as avg_latency,
      COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 0) as success_rate
    FROM usage_logs`
  ).get() as {
    total_requests: number;
    total_tokens: number;
    total_prompt_tokens: number;
    total_completion_tokens: number;
    avg_latency: number;
    success_rate: number;
  };

  return {
    totalRequests: row.total_requests,
    totalTokens: row.total_tokens,
    totalPromptTokens: row.total_prompt_tokens,
    totalCompletionTokens: row.total_completion_tokens,
    avgLatency: Math.round(row.avg_latency),
    successRate: Math.round(row.success_rate * 10) / 10,
  };
}
