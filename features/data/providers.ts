import { getDb } from "./db";

export interface Provider {
  id: number;
  name: string;
  base_url: string;
  auth_type: string;
  is_active: number;
  created_at: string;
}

export interface ProviderKey {
  id: number;
  provider_id: number;
  key: string;
  status: string;
  rotation_strategy: string;
  request_count: number;
  last_used_at: string | null;
  created_at: string;
}

export function createProvider(name: string, baseUrl: string, authType: string = "bearer"): Provider {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO providers (name, base_url, auth_type) VALUES (?, ?, ?)"
  );
  stmt.run(name, baseUrl, authType);
  return getProviderByName(name)!;
}

export function getProviderByName(name: string): Provider | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM providers WHERE name = ?").get(name) as Provider | undefined;
  return row || null;
}

export function getProviderById(id: number): Provider | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM providers WHERE id = ?").get(id) as Provider | undefined;
  return row || null;
}

export function listProviders(): Provider[] {
  const db = getDb();
  return db.prepare("SELECT * FROM providers ORDER BY name").all() as Provider[];
}

export function deleteProvider(id: number): void {
  const db = getDb();
  // Release references first so the delete also works on databases created
  // before the cascade rules were added to the schema.
  db.prepare("UPDATE usage_logs SET provider_id = NULL WHERE provider_id = ?").run(id);
  db.prepare("DELETE FROM provider_keys WHERE provider_id = ?").run(id);
  db.prepare("DELETE FROM provider_models WHERE provider_id = ?").run(id);
  db.prepare("DELETE FROM providers WHERE id = ?").run(id);
}

export function addProviderKey(providerId: number, key: string, rotationStrategy: string = "round_robin"): ProviderKey {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO provider_keys (provider_id, key, rotation_strategy) VALUES (?, ?, ?)"
  );
  stmt.run(providerId, key, rotationStrategy);
  return getProviderKeyById(getLastInsertId(db))!;
}

export function getProviderKeyById(id: number): ProviderKey | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM provider_keys WHERE id = ?").get(id) as ProviderKey | undefined;
  return row || null;
}

export function listProviderKeys(providerId: number): ProviderKey[] {
  const db = getDb();
  return db.prepare("SELECT * FROM provider_keys WHERE provider_id = ? ORDER BY id").all(providerId) as ProviderKey[];
}

export function deleteProviderKey(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM provider_keys WHERE id = ?").run(id);
}

export function updateProviderKeyStatus(id: number, status: string): void {
  const db = getDb();
  db.prepare("UPDATE provider_keys SET status = ? WHERE id = ?").run(status, id);
}

export function incrementProviderKeyUsage(id: number): void {
  const db = getDb();
  db.prepare("UPDATE provider_keys SET request_count = request_count + 1, last_used_at = datetime('now') WHERE id = ?").run(id);
}

function getLastInsertId(db: ReturnType<typeof getDb>): number {
  return (db.prepare("SELECT last_insert_rowid() as id").get() as { id: number }).id;
}
