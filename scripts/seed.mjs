import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scryptSync, randomBytes } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const dataDir = join(rootDir, "storage", "data");
const dbPath = join(dataDir, "omniswitch.db");

mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);

// Seed admin user (password: admin123)
const salt = randomBytes(16).toString("hex");
const passwordHash = scryptSync("admin123", salt, 64).toString("hex") + ":" + salt;

db.exec(`
  INSERT OR IGNORE INTO admin_users (id, username, password_hash)
  VALUES (1, 'admin', '${passwordHash}');
`);

// Seed default providers
const providers = [
  { name: "openai", base_url: "https://api.openai.com/v1", auth_type: "bearer" },
  { name: "anthropic", base_url: "https://api.anthropic.com/v1", auth_type: "header" },
  { name: "google", base_url: "https://generativelanguage.googleapis.com/v1beta", auth_type: "bearer" },
  { name: "groq", base_url: "https://api.groq.com/openai/v1", auth_type: "bearer" },
  { name: "openrouter", base_url: "https://openrouter.ai/api/v1", auth_type: "bearer" },
  { name: "deepseek", base_url: "https://api.deepseek.com/v1", auth_type: "bearer" },
];

for (const p of providers) {
  db.exec(
    `INSERT OR IGNORE INTO providers (name, base_url, auth_type) VALUES ('${p.name}', '${p.base_url}', '${p.auth_type}');`
  );
}

// Seed default models
const models = [
  { provider: "openai", model: "gpt-4o" },
  { provider: "openai", model: "gpt-4o-mini" },
  { provider: "openai", model: "gpt-4-turbo" },
  { provider: "anthropic", model: "claude-sonnet-4-20250514" },
  { provider: "anthropic", model: "claude-3-5-haiku-20241022" },
  { provider: "google", model: "gemini-2.0-flash" },
  { provider: "google", model: "gemini-1.5-pro" },
  { provider: "groq", model: "llama-3.3-70b-versatile" },
  { provider: "groq", model: "mixtral-8x7b-32768" },
  { provider: "openrouter", model: "openai/gpt-4o" },
  { provider: "openrouter", model: "anthropic/claude-3.5-sonnet" },
  { provider: "deepseek", model: "deepseek-chat" },
];

for (const m of models) {
  db.exec(
    `INSERT OR IGNORE INTO provider_models (provider_id, model_name)
     SELECT id, '${m.model}' FROM providers WHERE name = '${m.provider}';`
  );
}

db.close();
console.log("Seed data inserted successfully.");
