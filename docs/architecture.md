# Client Architecture

This document covers the design philosophy and folder structure of the Notto frontend.
For system-wide ADRs and API specs, see the [Notto-docs submodule](../Notto-docs/docs/).

---

## How to Design a Screen

Backend design starts from the domain and works outward:

```
Business Logic → Use Case → Endpoint
```

Frontend design starts from the user and works inward:

```
Screen → Interaction → State → Data
```

For each new page or feature, work through these four questions in order:

| Layer | Question |
|---|---|
| **Screen** | What does the user see? (sketch it, even mentally) |
| **Interaction** | What can the user do? What changes when they do it? |
| **State** | What data does this screen need to exist? |
| **Data** | Where does that data come from? (LocalDB / API / URL params) |

### Example: QuizPage

```
Screen      : 1問 + 進捗バー + 回答ボタン4つ
Interaction : 回答を選ぶ → 次の問題へ、最後の問題 → 結果へ遷移
State       : { currentQuiz, index, total, answers[] }
Data        : LocalSQLite から selectQuizzes() で10問取得
```

This analysis directly maps to the implementation: `useQuizRun` is the hook that owns this state, `selectQuizzes()` in `domain/` is the data selection logic, and `QuizPage` is the thin component that renders it.

### Hooks as use cases

A custom hook is the frontend equivalent of a backend use case. It encapsulates one user-facing operation end-to-end:

```
Backend use case  →  Frontend hook
"run a quiz"      →  useQuizRun()
"generate quizzes"→  useGenerate()
"load user data"  →  useSync()
```

Pages call hooks. Hooks call `api/` and `db/`. Pages do not call `api/` or `db/` directly.

---

## Design Philosophy

### Local-first, network-optional

All reads come from a local SQLite database (sql.js in-memory for MVP, disk-based for production native app). The server is the source of truth at startup, but the client never blocks on the network. See [sqlite-strategy.md](./sqlite-strategy.md) for the MVP vs production tradeoff.

### Best-effort sync

Writes go to local DB first and always succeed from the user's perspective. Server sync is fire-and-forget. A failed POST to `/quiz-runs` does not surface an error to the user.

### No global state library

React hooks are sufficient for MVP. Each page owns its state via custom hooks. If cross-page state becomes necessary, reach for React Context before adding a library like Zustand.

### MSW as the development contract

The mock handlers in `src/mocks/handlers.ts` are the authoritative description of what the client expects from the server during development. Activate with `VITE_USE_MOCK=true`.

---

## Folder Structure

```
src/
├── api/          # HTTP client and API method definitions
├── assets/       # Static assets (images, fonts, icons)
├── components/   # Reusable UI components shared across pages
├── db/           # SQLite layer — schema, migrations, repositories
├── domain/       # Pure business logic (no React, no I/O)
├── hooks/        # Custom React hooks — orchestrate api + db + state
├── mocks/        # MSW browser setup and mock handlers
├── pages/        # Route-level components
└── types/        # Shared TypeScript interfaces
```

### `api/`

Two files only:

- `client.ts` — minimal `fetch` wrapper. Handles base URL, JSON headers, and non-2xx errors.
- `index.ts` — one typed function per endpoint (`getMe`, `generate`, `submitQuizRun`). No logic here beyond constructing the request and typing the response.

### `db/`

Repository pattern over sql.js.

- `index.ts` — lazy singleton `getDb()`, schema creation, migrations. Called once at startup.
- One `*Repository.ts` per entity. Each file exports functions that take a `Database` instance and return typed domain objects.

JSON columns (arrays, nested objects) are serialized on write and parsed on read within the repository. Callers never see raw SQL.

### `domain/`

Pure functions with no side effects. Currently contains `recommendation.ts` — the quiz selection algorithm. Nothing here should import React or touch the DB directly.

### `hooks/`

The orchestration layer. Each hook:

1. Calls one or more API methods or repository functions
2. Manages local loading/error state
3. Returns a clean interface to the page

| Hook | Responsibility |
|---|---|
| `useQuizDataSync` | `GET /context-objects` + `GET /quiz-runs` → bulk insert into local DB on app load |
| `useSyncContext` | Wraps `useQuizDataSync` in a React Context (`SyncProvider` + `useSyncStatus`). `SyncProvider` lives in `App.tsx` and calls `sync()` once at startup. Pages read sync status via `useSyncStatus()`. |
| `useQuizHistory` | Load all quiz runs + records from local DB once sync is done |
| `useQuizReview` | Load records, quizzes, and context objects for a specific run |
| `useQuizRun` | Load quizzes + context objects, run a session, save results locally, POST to server |
| `useGenerate` | `POST /quizzes` → insert AI-generated quizzes |

### `assets/`

Static files (images, icons, fonts) imported directly by components.

### `components/`

Reusable UI components shared across two or more pages. Each component lives in its own file. Components are pure presentational or lightly stateful — they do not call `api/` or `db/` directly.

If a component is only used by a single page, keep it in that page's file until it is needed elsewhere.

### `mocks/`

- `browser.ts` — MSW worker setup, imported conditionally in `main.tsx`
- `handlers.ts` — one handler per API route, with realistic Korean/Japanese example data

### `pages/`

One file per route. Pages are thin: they call hooks and render UI. No data-fetching logic should live in a page directly.

### `types/`

Shared TypeScript interfaces used across `api/`, `db/`, and `hooks/`. If a type is only used inside one module, keep it local.

---

## Data Flow

### Startup

```
main.tsx → App.tsx → page mounts
  → useSync() → api.getMe()
  → bulk insert into local SQLite
  → page reads from local DB
```

### Quiz generation

```
HomePage → useGenerate()
  → POST /quizzes
  → insert new ContextObjects + Quizzes into local DB
```

### Quiz run

```
QuizPage → useQuizRun()
  → load quizzes from local DB
  → selectQuizzes() picks 10 (by miss rate, then recency)
  → user answers each
  → save QuizRun + QuizRecords to local DB
  → fire-and-forget POST /quiz-runs
```

---

## Technology Stack

| Concern | Choice |
|---|---|
| UI | React 19 |
| Routing | React Router 7 |
| Language | TypeScript (strict) |
| Build | Vite |
| Local DB | sql.js (SQLite in WASM) |
| API mocking | MSW 2 |

---

## MVP Constraints

- SQLite is in-memory only. All data is lost on page reload; `useSync` re-hydrates from the server.
- No authentication flow is implemented yet. `LoginPage` is a stub.
- Page components are mostly empty shells. UI components are not yet built.
- No offline support. MSW substitutes for the backend during development.
