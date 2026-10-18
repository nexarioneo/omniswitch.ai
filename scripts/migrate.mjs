import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const dataDir = join(rootDir, "storage", "data");
const dbPath = join(dataDir, "omniswitch.db");

mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);
const schema = readFileSync(join(rootDir, "features", "data", "schema.sql"), "utf8");

db.exec(schema);
db.close();

console.log("Migration applied successfully.");
