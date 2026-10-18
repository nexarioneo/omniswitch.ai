import { getDb } from "./db";

export interface ProviderModel {
  id: number;
  provider_id: number;
  model_name: string;
  is_enabled: number;
  priority: number;
}

export function listModels(): ProviderModel[] {
  const db = getDb();
  return db.prepare("SELECT * FROM provider_models ORDER BY provider_id, priority DESC, model_name").all() as ProviderModel[];
}

export function listEnabledModels(): ProviderModel[] {
  const db = getDb();
  return db.prepare("SELECT * FROM provider_models WHERE is_enabled = 1 ORDER BY provider_id, priority DESC, model_name").all() as ProviderModel[];
}

export function getModelByName(modelName: string): ProviderModel | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM provider_models WHERE model_name = ? AND is_enabled = 1").get(modelName) as ProviderModel | undefined;
  return row || null;
}

export function updateModel(id: number, isEnabled: number): void {
  const db = getDb();
  db.prepare("UPDATE provider_models SET is_enabled = ? WHERE id = ?").run(isEnabled, id);
}

export function addModel(providerId: number, modelName: string, priority: number = 0): void {
  const db = getDb();
  db.prepare(
    "INSERT OR IGNORE INTO provider_models (provider_id, model_name, priority) VALUES (?, ?, ?)"
  ).run(providerId, modelName, priority);
}
