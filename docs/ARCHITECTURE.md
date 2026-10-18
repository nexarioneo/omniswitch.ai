---
id: omniswitch-architecture
version: 1.0.0
status: active
scope: "Project architecture for this repo. DESIGN.md owns visual design; this file owns code organization, data layer, routing, and the gateway pipeline."
stack: "Next.js, React, Tailwind CSS v4, TypeScript, SQLite (node:sqlite)"
---

# ARCHITECTURE.md: AI Gateway API Architecture

> One line: an OpenAI-compatible API gateway that routes to multiple AI providers, with per-client API keys, token-based rate limiting, provider key rotation, and usage tracking.

## 0. HOW TO READ THIS DOCUMENT

This file is the **single source of truth** for code organization. `DESIGN.md` owns visual design. This file owns where code lives and how it flows.

Conventions:

- `code` means a literal path, file, or symbol
- **Bold** means a canonical name
- `[AI DIRECTIVE]` means a hard constraint
- MUST / NEVER / OPTIONAL set the obligation level

Read order for AI:

1. §1 for goals, then §3 for the selected shape
2. §4 for the directory map before creating any file
3. §5 and §6 before writing any component or data function
4. §7 before adding any route
5. Run §14 before finishing

---

## 1. GOALS AND NON-GOALS

Goals:

1. One OpenAI-compatible API surface that routes to any AI provider
2. Per-client API keys with token-based or unlimited rate limiting
3. Multiple provider keys per provider with rotation strategies
4. SSE streaming support
5. Usage tracking and cost estimation
6. Admin dashboard for managing keys, providers, and models

Non-goals:

1. No multi-tenant isolation (single admin user)
2. No serverless deployment (single Node process)
3. No provider failover (retry same provider, not different provider)

---

## 2. SELECTED ARCHITECTURE

Name: **OpenAI-compatible gateway with provider adapters**

Shape:

```text
app/
  api/
    v1/                    OpenAI-compatible endpoints
      chat/completions/route.ts
      completions/route.ts
      models/route.ts
      health/route.ts
    admin/                 Admin API
      api-keys/route.ts
      providers/route.ts
      providers/[id]/route.ts
      models/route.ts
      usage/route.ts
  admin/                   Dashboard pages
    (panel)/
      page.tsx             Overview
      api-keys/page.tsx
      providers/page.tsx
      providers/[id]/page.tsx
      models/page.tsx
      usage/page.tsx
      settings/page.tsx
components/
  ui/                      Shared presentational UI
  layout/                  Sidebar, Header, Shell
  dashboard/               Domain composites
features/
  gateway/                 Gateway pipeline logic
    auth.ts                API key validation
    rate-limit.ts          Token-based limiter
    router.ts              Model to provider mapping
    key-rotator.ts         Provider key rotation
    retry.ts               Exponential backoff retry
    normalize.ts           Request/response normalizer
    stream.ts              SSE streaming handler
  providers/               Provider adapters
    index.ts               Registry
    openai.ts              OpenAI adapter
    anthropic.ts           Anthropic adapter
    google.ts              Google Gemini adapter
    groq.ts                Groq adapter
    openrouter.ts          OpenRouter adapter
    deepseek.ts            DeepSeek adapter
  data/                    Data access layer
    db.ts                  SQLite connection
    schema.sql             Database schema
    api-keys.ts            API key CRUD
    providers.ts           Provider CRUD
    models.ts              Model allowlist
    usage.ts               Usage logging
lib/                       Framework-free utilities
  tokens.ts                Token mirror (DESIGN.md)
  validate.ts              Zod schemas
  format.ts                Number/date formatting
```

---

## 3. DIRECTORY MAP

```text
app/
  layout.tsx               Root layout
  globals.css              Tailwind import + @theme token bridge
  admin/
    login/page.tsx
    (panel)/
      layout.tsx           Authenticated shell
      page.tsx             Overview dashboard
      api-keys/page.tsx
      providers/page.tsx
      providers/[id]/page.tsx   Provider detail
      models/page.tsx
      usage/page.tsx
      settings/page.tsx
  api/
    v1/
      chat/completions/route.ts
      completions/route.ts
      models/route.ts
      health/route.ts
    admin/
      api-keys/route.ts
      providers/route.ts
      providers/[id]/route.ts
      models/route.ts
      usage/route.ts
components/
  ui/                      Button, Card, Input, Badge, Table, Modal
  layout/                  Sidebar, Header, Shell
  dashboard/               StatCard, ProviderCard, ApiKeyTable, UsageTable
features/
  gateway/                 Auth, rate-limit, router, key-rotator, retry, normalize, stream
  providers/               Adapter per provider
  data/                    DB connection, schema, CRUD modules
lib/
  tokens.ts
  validate.ts
  format.ts
scripts/
  migrate.mjs              Apply schema.sql
  seed.mjs                 Seed initial data
storage/
  data/                    SQLite database (gitignored)
```

---

## 4. LAYERING AND DEPENDENCY RULES

### 4.1 Dependency direction

```text
app/ -> features/ and components/ -> lib/ and types/
```

Rules:

1. MUST: `app/` routes compose from `features/` and `components/`
2. MUST: `features/` may import from `components/`, `lib/`, and `types/`
3. MUST: `components/` may import from `lib/` and `types/` only
4. MUST: `lib/` and `types/` import from nothing project internal
5. NEVER: no circular imports between layers

---

## 5. DATABASE SCHEMA

### 5.1 Tables

```sql
-- Client API keys
CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  rate_limit_type TEXT NOT NULL DEFAULT 'token', -- 'token' | 'unlimited'
  rate_limit_value INTEGER, -- tokens per window (null = unlimited)
  rate_limit_window INTEGER DEFAULT 86400, -- window in seconds
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT
);

-- AI providers
CREATE TABLE IF NOT EXISTS providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  base_url TEXT NOT NULL,
  auth_type TEXT NOT NULL DEFAULT 'bearer', -- 'bearer' | 'header'
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Provider API keys (multiple per provider)
CREATE TABLE IF NOT EXISTS provider_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL REFERENCES providers(id),
  key TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- 'active' | 'exhausted' | 'error'
  rotation_strategy TEXT DEFAULT 'round_robin', -- 'round_robin' | 'sequential' | 'random'
  request_count INTEGER DEFAULT 0,
  last_used_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Model allowlist per provider
CREATE TABLE IF NOT EXISTS provider_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL REFERENCES providers(id),
  model_name TEXT NOT NULL,
  is_enabled INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,
  UNIQUE(provider_id, model_name)
);

-- Usage log
CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key_id INTEGER REFERENCES api_keys(id),
  provider_id INTEGER REFERENCES providers(id),
  model TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  latency_ms INTEGER,
  status TEXT DEFAULT 'success', -- 'success' | 'error' | 'rate_limited'
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
  user_id INTEGER NOT NULL REFERENCES admin_users(id),
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## 6. GATEWAY PIPELINE

### 6.1 Request flow

```
Client request
    |
    v
[Auth] Validate API key
    |
    v
[Rate Limit] Check token quota
    |
    v
[Model Check] Is model allowed?
    |
    v
[Router] Map model to provider
    |
    v
[Key Rotator] Select provider key
    |
    v
[Adapter] Normalize request to provider format
    |
    v
[Retry] Call provider with exponential backoff
    |
    v
[Adapter] Normalize response to OpenAI format
    |
    v
[Log] Record usage
    |
    v
Response to client (OpenAI format)
```

### 6.2 Provider adapter interface

Each provider adapter implements:

```typescript
interface ProviderAdapter {
  // Normalize OpenAI request to provider format
  normalizeRequest(openaiRequest: OpenAIRequest): ProviderRequest;

  // Normalize provider response to OpenAI format
  normalizeResponse(providerResponse: ProviderResponse): OpenAIResponse;

  // Normalize streaming chunk to OpenAI SSE format
  normalizeStreamChunk(chunk: unknown): string | null;

  // Get auth headers for provider
  getAuthHeaders(key: string): Record<string, string>;
}
```

### 6.3 Key rotation strategies

| Strategy | Behavior |
|---|---|
| round_robin | Cycle through keys sequentially per request |
| sequential | Use first key until exhausted, then move to next |
| random | Pick random active key per request |

### 6.4 Retry policy

- Max 3 retries
- Exponential backoff: 1s, 2s, 4s
- Only retry on: 429 (rate limit), 500, 502, 503, 504
- Do NOT retry on: 400, 401, 403, 404

---

## 7. API ENDPOINTS

### 7.1 OpenAI-compatible endpoints

| Method | Path | Description |
|---|---|---|
| POST | /v1/chat/completions | Chat completions (streaming + non-streaming) |
| POST | /v1/completions | Text completions |
| GET | /v1/models | List allowed models |
| GET | /v1/health | Provider health status |

### 7.2 Admin endpoints

| Method | Path | Description |
|---|---|---|
| POST | /v1/admin/api-keys | Create API key |
| GET | /v1/admin/api-keys | List API keys |
| DELETE | /v1/admin/api-keys/:id | Delete API key |
| POST | /v1/admin/providers | Add provider |
| GET | /v1/admin/providers | List providers |
| GET | /v1/admin/providers/:id | Provider detail with keys |
| DELETE | /v1/admin/providers/:id | Delete provider |
| POST | /v1/admin/providers/:id/keys | Add provider key |
| DELETE | /v1/admin/providers/:id/keys/:keyId | Delete provider key |
| GET | /v1/admin/models | List models |
| PUT | /v1/admin/models/:id | Update model (enable/disable) |
| GET | /v1/admin/usage | Usage statistics |

---

## 8. STREAMING

### 8.1 SSE format

All streaming responses use Server-Sent Events in OpenAI format:

```
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"...","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","model":"...","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

### 8.2 Implementation

1. Provider returns stream
2. Adapter transforms each chunk to OpenAI format
3. Gateway pipes chunks to client as SSE
4. On error, send error event then close

---

## 9. SECURITY

| Layer | Rule |
|---|---|
| API keys | SHA-256 hashed in database |
| Provider keys | Encrypted at rest (AES-256-GCM) |
| Admin auth | scrypt password hashing, DB-backed sessions |
| Rate limiting | In-memory sliding window |
| CORS | Restrict to dashboard origin |
| Input validation | Zod schemas on all inputs |

---

## 10. RENDERING AND CACHING

1. MUST: dashboard pages are Server Components by default
2. MUST: API routes are dynamic (no caching)
3. MUST: admin data is fresh per request
4. NEVER: cache provider keys or API keys in client components

---

## 11. TOOLING AND QUALITY GATES

| Tool | Use |
|---|---|
| npm run dev | Local development |
| npm run build | Production gate |
| npm run lint | ESLint |
| npm run db:migrate | Apply schema |
| npm run db:seed | Seed initial data |

---

## 12. AI CHECKLISTS

### 12.1 Pre-flight

1. Which layer does the new file belong to?
2. Server or Client component?
3. New route? Confirm it exists in the route table
4. New data? Confirm the schema and types exist
5. New token or color? Stop. Tokens come from DESIGN.md only

### 12.2 Post-flight

- [ ] Dependency direction holds, no cycles
- [ ] Client boundaries are minimal
- [ ] Empty, loading, error states exist for every data block
- [ ] No dead links
- [ ] Dark mode is default
- [ ] Status is never color alone
- [ ] Build passes clean

---

## 13. CHANGE LOG

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-10-17 | Initial architecture |
