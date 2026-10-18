-- Client API keys
CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  rate_limit_type TEXT NOT NULL DEFAULT 'token',
  rate_limit_value INTEGER,
  rate_limit_window INTEGER DEFAULT 86400,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT
);

-- AI providers
CREATE TABLE IF NOT EXISTS providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  base_url TEXT NOT NULL,
  auth_type TEXT NOT NULL DEFAULT 'bearer',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Provider API keys (multiple per provider)
CREATE TABLE IF NOT EXISTS provider_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  rotation_strategy TEXT DEFAULT 'round_robin',
  request_count INTEGER DEFAULT 0,
  last_used_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Model allowlist per provider
CREATE TABLE IF NOT EXISTS provider_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  is_enabled INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,
  UNIQUE(provider_id, model_name)
);

-- Usage log
CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key_id INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
  provider_id INTEGER REFERENCES providers(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  latency_ms INTEGER,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Gateway settings (key/value)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);
