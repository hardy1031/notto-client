import initSqlJs, { type Database } from 'sql.js'

const IDB_DB_NAME = 'notto'
const IDB_STORE_NAME = 'sqlite'
const IDB_KEY = 'db'

let db: Database | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null

// ── IndexedDB helpers ──────────────────────────────────────────────

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE_NAME)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function loadFromIdb(): Promise<Uint8Array | null> {
  const idb = await openIdb()
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE_NAME, 'readonly')
    const req = tx.objectStore(IDB_STORE_NAME).get(IDB_KEY)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

async function saveToIdb(data: Uint8Array): Promise<void> {
  const idb = await openIdb()
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE_NAME, 'readwrite')
    tx.objectStore(IDB_STORE_NAME).put(data, IDB_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ── Debounced persist ──────────────────────────────────────────────

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (!db) return
    saveToIdb(db.export()).catch(e => console.error('[db] IndexedDB save failed:', e))
  }, 300)
}

// ── DB init ────────────────────────────────────────────────────────

export async function getDb(): Promise<Database> {
  if (db) return db

  const SQL = await initSqlJs({
    locateFile: (file: string) => `/node_modules/sql.js/dist/${file}`,
  })

  const saved = await loadFromIdb()
  db = saved ? new SQL.Database(saved) : new SQL.Database()

  runMigrations(db)

  return db
}

// Wrap db.run to auto-persist after every write
export async function dbRun(sql: string, params?: (string | number | null | Uint8Array)[]): Promise<void> {
  const database = await getDb()
  database.run(sql, params)
  scheduleSave()
}

// ── Migrations ─────────────────────────────────────────────────────

function runMigrations(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      user_name TEXT NOT NULL,
      first_language TEXT NOT NULL,
      target_language TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS notebooks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      notebook_id TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      s3_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // MVP only: note content stored locally instead of S3
  db.run(`
    CREATE TABLE IF NOT EXISTS note_contents (
      note_id TEXT PRIMARY KEY,
      content TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS note_pieces (
      id TEXT PRIMARY KEY,
      note_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS context_objects (
      id TEXT PRIMARY KEY,
      note_piece_id TEXT NOT NULL,
      note_id TEXT NOT NULL,
      expression TEXT NOT NULL,
      base_meaning TEXT NOT NULL,
      actual_nuance TEXT NOT NULL,
      tone TEXT NOT NULL,
      formality TEXT NOT NULL CHECK(formality IN ('casual', 'neutral', 'formal')),
      is_slang INTEGER NOT NULL,
      example_dialogue TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      context_object_id TEXT NOT NULL,
      type TEXT NOT NULL,
      question_sentence TEXT NOT NULL,
      answer TEXT NOT NULL,
      choice_pool TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS quiz_runs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS quiz_records (
      id TEXT PRIMARY KEY,
      quiz_run_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      choices TEXT NOT NULL,
      user_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `)

  // schema migrations for existing DBs
  try { db.run(`ALTER TABLE notes ADD COLUMN name TEXT NOT NULL DEFAULT ''`) } catch {}

  // indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON notes(notebook_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_note_pieces_note_id ON note_pieces(note_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_context_objects_note_id ON context_objects(note_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_context_objects_note_piece_id ON context_objects(note_piece_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_quizzes_context_object_id ON quizzes(context_object_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_quiz_runs_user_id ON quiz_runs(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_quiz_records_quiz_run_id ON quiz_records(quiz_run_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_quiz_records_quiz_id ON quiz_records(quiz_id)`)
}
