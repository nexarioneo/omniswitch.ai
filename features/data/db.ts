import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const dataDir = join(process.cwd(), "storage", "data");
const dbPath = join(dataDir, "omniswitch.db");

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    mkdirSync(dataDir, { recursive: true });
    db = new DatabaseSync(dbPath);
    db.exec("PRAGMA foreign_keys = ON");
  }
  return db;
}
