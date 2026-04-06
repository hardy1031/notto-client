# notto-frontend

Client SPA for Notto — a context-first Korean language review app. See [product_design.md](Notto-docs/docs/product_design.md) for the full product vision.

## Stack

Vite + React + TypeScript, running on Bun. Local SQLite (via sql.js or wa-sqlite) for offline quiz storage and review tracking. See [mvp_spec.md](Notto-docs/docs/mvp_spec.md) and [system_architecture.md](Notto-docs/docs/system_architecture.md) for full details.

## Development

### Prerequisites

- [Bun](https://bun.sh) installed

### Install

```bash
bun install
```

### Run (mock mode — no server needed)

```bash
# .env.local
VITE_USE_MOCK=true
```

```bash
bun run dev
```

API requests are intercepted by MSW (Mock Service Worker) in the browser. No server or Joplin instance required. Mock response definitions: [mock_api.md](Notto-docs/docs/mock_api.md).

### Run (full MVP — with server)

Requires:
1. Joplin desktop running locally with Data API enabled (`localhost:41184`)
2. [notto-backend](https://github.com/HardyTensai/notto-backend) running (`bun run dev` — defaults to `localhost:3000`)

```bash
# .env.local
VITE_API_URL=http://localhost:3000
```

```bash
bun run dev
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_USE_MOCK` | No | `false` | Enable MSW mock mode. When `true`, all API calls are intercepted locally — no server needed. |
| `VITE_API_URL` | No | `http://localhost:3000` | Base URL of the notto-backend server. Ignored when `VITE_USE_MOCK=true`. |

Create a `.env.local` file in the project root (gitignored) to set these.
