# Omniswitch AI Gateway

OpenAI-compatible API gateway that routes to multiple AI providers (OpenAI, Anthropic, Google Gemini, Groq, OpenRouter, DeepSeek, dan lainnya).

## Konsep

Client menggunakan API dengan format OpenAI (endpoint dan request/response), di gateway meroute ke provider AI apapun yang dikonfigurasi.

```
Client -> OpenAI Format -> [Gateway] -> Provider (OpenAI/Anthropic/Gemini/dll)
```

## Fitur

- OpenAI-compatible API (`/v1/chat/completions`, `/v1/models`, dll)
- Multi-provider routing
- Per-client API keys
- Token-based / unlimited rate limiting
- Multiple provider keys dengan rotation strategy
- SSE streaming
- Usage tracking
- Admin dashboard untuk manage keys, providers, models

## Menjalankan

```bash
npm install
npm run db:migrate   # buat tabel
npm run db:seed      # user admin + daftar provider default
npm run dev          # atau: npm run build && npm start
```

- Dashboard: `http://localhost:3000/admin`, login pertama `admin` / `admin123`
- Ganti password di halaman Settings setelah login pertama
- Endpoint gateway memakai format OpenAI: `http://localhost:3000/v1/chat/completions`
- Tambahkan provider key di halaman Providers (buka kartu provider, lalu Add Key) sebelum request pertama

## Dokumentasi

- `docs/ARCHITECTURE.md` - arsitektur kode, data layer, gateway pipeline
- `DESIGN.md` - design system untuk dashboard

## Tech Stack

- Next.js (App Router) + TypeScript
- SQLite (node:sqlite)
- Tailwind CSS v4
