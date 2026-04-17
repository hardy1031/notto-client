# SQLite Strategy: MVP vs Production

## MVP (Web SPA)

### Implementation

SQLite runs **in-memory** via sql.js (SQLite compiled to WebAssembly), persisted to **IndexedDB** between sessions.

```
App starts
  → sql.js loads .wasm
  → load serialized DB binary from IndexedDB (if exists)
  → restore sql.js DB from binary  ← user's data is back
  → run startup sync with server

User interacts
  → reads/writes go to in-memory sql.js DB
  → after each write, DB is serialized (Uint8Array) and saved to IndexedDB (300ms debounce)

App closes / page reloads
  → IndexedDB retains the binary → data survives
```

### Why IndexedDB
Browsers cannot write directly to the filesystem. IndexedDB is the standard browser API for storing binary data. We serialize the entire sql.js DB on every write (debounced), so the local state is always recoverable.

### Data persistence
Data persists across reloads via IndexedDB. On startup, the app also syncs with the server to pull any data the client is missing (see [API design](/notto-docs/docs/api_design.md)).

---

## Production (Native App)

### Implementation

SQLite runs against a **real file on disk** — the standard SQLite behavior.

```
App starts → opens ~/path/to/notto.db (or platform equivalent)
User interacts → reads/writes go to the .db file (with in-memory caching)
App closes → file remains on disk
```

### Why disk
Native apps have full filesystem access. SQLite's default mode writes to a `.db` file, so data persists across sessions with no extra work. No serialization overhead.

### Data persistence
Local SQLite is the **primary store**. On startup, the app syncs with the server via the `/sync/*` endpoints to pull anything it's missing. Between syncs, all reads are served from local SQLite. Writes go to local SQLite first, then synced to the server in the background (fire-and-forget).

---

## Summary

| | MVP | Production |
|---|---|---|
| Platform | Web SPA (browser) | Native app (iOS/Android) |
| SQLite engine | sql.js (WebAssembly, in-memory) | Native SQLite (.db file on disk) |
| Persistence | IndexedDB (serialized DB binary) | Disk — native SQLite default |
| On app start | Restore from IndexedDB + server sync | Open .db file + server sync |
| Startup sync | `POST /sync/notebooks` → `POST /sync/quizzes` → `POST /sync/quiz-runs` | Same |

---

## Note Content Storage

### MVP
Note content is stored in a `note_contents` table in sql.js, persisted to IndexedDB along with the rest of the DB.

```sql
CREATE TABLE note_contents (
  note_id TEXT PRIMARY KEY,
  content TEXT NOT NULL
)
```

Content format stored in the `content` column:

```
@note <note-uuid>

- expression :: annotation
- expression :: annotation
```

This is a deliberate MVP compromise — browsers cannot write to the filesystem, so content lives in the DB.

### Production
Note content is written to the native filesystem as **`.txt` files**, one file per note. The file path is stored in `notes.s3_key`.

```
~/notto/notes/<note-uuid>.txt
```

File format (same as MVP `content` column):

```
@note <note-uuid>

- expression :: annotation
- expression :: annotation
```

### Migration: MVP → Production
1. Read `note_contents.content` for each note
2. Write content to `~/notto/notes/<note-id>.txt`
3. Store the file path in `notes.s3_key`
4. Drop the `note_contents` table

---

## Quiz Screen Data Source

The quiz screen reads quizzes directly from local SQLite — there is no separate GET endpoint for quizzes.

On startup, `POST /sync/quizzes` pulls all context objects and quizzes the client is missing from the server. The quiz screen then queries local SQLite at runtime. This applies to both MVP and production.
