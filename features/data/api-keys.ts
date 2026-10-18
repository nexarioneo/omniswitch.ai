import { getDb } from "./db";
import { randomBytes, createHash } from "node:crypto";

export interface ApiKey {
  id: number;
  key: string;
  name: string;
  rate_limit_type: string;
  rate_limit_value: number | null;
  rate_limit_window: number;
  is_active: number;
  created_at: string;
  expires_at: string | null;
}

export function generateApiKey(): string {
  return "sk-" + randomBytes(32).toString("hex");
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function createApiKey(
  name: string,
  rateLimitType: string = "token",
  rateLimitValue: number | null = null,
  rateLimitWindow: number = 86400
): { key: ApiKey; plaintextKey: string } {
  const db = getDb();
  const plaintextKey = generateApiKey();
  const hashed = hashApiKey(plaintextKey);

  db.prepare(
    `INSERT INTO api_keys (key, name, rate_limit_type, rate_limit_value, rate_limit_window)
     VALUES (?, ?, ?, ?, ?)`
  ).run(hashed, name, rateLimitType, rateLimitValue, rateLimitWindow);

  const id = (db.prepare("SELECT last_insert_rowid() as id").get() as { id: number }).id;
  return { key: getApiKeyById(id)!, plaintextKey };
}

export function getApiKeyByName(name: string): ApiKey | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM api_keys WHERE name = ?").get(name) as ApiKey | undefined;
  return row || null;
}

export function getApiKeyById(id: number): ApiKey | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM api_keys WHERE id = ?").get(id) as ApiKey | undefined;
  return row || null;
}

export function validateApiKey(key: string): ApiKey | null {
  const db = getDb();
  const hashed = hashApiKey(key);
  const row = db.prepare(
    "SELECT * FROM api_keys WHERE key = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))"
  ).get(hashed) as ApiKey | undefined;
  return row || null;
}

export function listApiKeys(): ApiKey[] {
  const db = getDb();
  return db.prepare("SELECT * FROM api_keys ORDER BY created_at DESC").all() as ApiKey[];
}

export function deleteApiKey(id: number): void {
  const db = getDb();
  // Keep usage history, but release the reference before removing the key.
  db.prepare("UPDATE usage_logs SET api_key_id = NULL WHERE api_key_id = ?").run(id);
  db.prepare("DELETE FROM api_keys WHERE id = ?").run(id);
}

export function updateApiKey(id: number, updates: Partial<Pick<ApiKey, "name" | "rate_limit_type" | "rate_limit_value" | "rate_limit_window" | "is_active">>): void {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.name !== undefined) { fields.push("name = ?"); values.push(updates.name); }
  if (updates.rate_limit_type !== undefined) { fields.push("rate_limit_type = ?"); values.push(updates.rate_limit_type); }
  if (updates.rate_limit_value !== undefined) { fields.push("rate_limit_value = ?"); values.push(updates.rate_limit_value); }
  if (updates.rate_limit_window !== undefined) { fields.push("rate_limit_window = ?"); values.push(updates.rate_limit_window); }
  if (updates.is_active !== undefined) { fields.push("is_active = ?"); values.push(updates.is_active); }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE api_keys SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }
}
