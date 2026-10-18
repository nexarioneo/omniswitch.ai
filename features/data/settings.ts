import { getDb } from "./db";

export interface GatewaySettings {
  gateway_name: string;
  default_rate_limit: number;
  log_retention_days: number;
}

const DEFAULTS: GatewaySettings = {
  gateway_name: "Omniswitch AI",
  default_rate_limit: 100000,
  log_retention_days: 30,
};

export function getSettings(): GatewaySettings {
  const rows = getDb().prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const stored = new Map(rows.map((row) => [row.key, row.value]));

  return {
    gateway_name: stored.get("gateway_name") ?? DEFAULTS.gateway_name,
    default_rate_limit: Number(stored.get("default_rate_limit") ?? DEFAULTS.default_rate_limit),
    log_retention_days: Number(stored.get("log_retention_days") ?? DEFAULTS.log_retention_days),
  };
}

export function updateSettings(next: GatewaySettings): GatewaySettings {
  const db = getDb();
  const upsert = db.prepare(
    `INSERT INTO settings (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  );

  upsert.run("gateway_name", next.gateway_name);
  upsert.run("default_rate_limit", String(next.default_rate_limit));
  upsert.run("log_retention_days", String(next.log_retention_days));

  return getSettings();
}
