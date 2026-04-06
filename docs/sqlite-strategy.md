# SQLite Strategy: MVP vs Production

## MVP (Web SPA)

### Implementation
SQLite runs **in-memory** via sql.js (SQLite compiled to WebAssembly).

```
App starts → sql.js loads .wasm → SQLite DB created in browser memory
User interacts → reads/writes go to in-memory DB
App closes / page reloads → DB is gone
```

### Why in-memory
Browsers cannot write directly to the filesystem for security reasons. sql.js works around this by running SQLite entirely in RAM via WebAssembly.

### Data persistence
Data is not persisted across reloads. On every app start, the client calls `GET /me` to sync all user data from the server into the in-memory SQLite DB. This is acceptable for MVP because:
- The server (Joplin proxy) is the source of truth
- The sync happens at startup and is fast enough for a single-user local setup
- The MVP runs on a single device with the server always available locally

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
Native apps (iOS/Android) have full filesystem access. SQLite's default mode writes to a `.db` file, so data persists across sessions with no extra work.

### Performance
Disk access is not as slow as it sounds. SQLite keeps frequently accessed data in a memory cache and batches writes. Most reads are served from memory; disk writes happen in the background.

### Data persistence
Local SQLite becomes a **cache** of the Supabase cloud DB. On startup, the app syncs via `GET /me`. Between syncs, all reads are served from local SQLite for speed and offline support. Writes go to local SQLite first, then synced to the server in the background (fire-and-forget).

---

## Summary

| | MVP | Production |
|---|---|---|
| Platform | Web SPA (browser) | Native app (iOS/Android) |
| SQLite location | Browser memory (via WebAssembly) | Disk (`.db` file) |
| Persistence | None — lost on reload | Full — persists across sessions |
| Source of truth | Server (Joplin proxy) | Supabase PostgreSQL |
| Local SQLite role | Working DB for the session | Offline cache + fast reads |
| On app start | `GET /me` to rebuild from server | `GET /me` to sync latest from server |
