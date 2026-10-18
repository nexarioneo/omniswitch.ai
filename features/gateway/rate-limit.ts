import type { ApiKey } from "../data/api-keys";
import { getDb } from "../data/db";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(apiKey: ApiKey, estimatedTokens: number = 0): RateLimitResult {
  if (apiKey.rate_limit_type === "unlimited" || !apiKey.rate_limit_value) {
    return { allowed: true, remaining: Infinity, resetAt: 0 };
  }

  const db = getDb();
  const windowSeconds = Math.max(1, Number(apiKey.rate_limit_window) || 86400);

  const row = db.prepare(
    `SELECT COALESCE(SUM(total_tokens), 0) as used
     FROM usage_logs
     WHERE api_key_id = ? AND created_at > datetime('now', ?)`
  ).get(apiKey.id, `-${windowSeconds} seconds`) as { used: number };

  const used = row.used;
  const limit = apiKey.rate_limit_value;
  const remaining = Math.max(0, limit - used);

  return {
    allowed: used + estimatedTokens <= limit,
    remaining,
    resetAt: Date.now() + apiKey.rate_limit_window * 1000,
  };
}
