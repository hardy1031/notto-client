import initSqlJs, { Database } from 'sql.js'

let db: Database | null = null

export async function getDb(): Promise<Database> {
  if (db) return db

  const SQL = await initSqlJs({
    locateFile: (file: string) => `/node_modules/sql.js/dist/${file}`,
  })

  db = new SQL.Database()
  runMigrations(db)
  return db
}

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
      s3_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS context_objects (
      id TEXT PRIMARY KEY,
      note_id TEXT NOT NULL,
      expression TEXT NOT NULL,
      base_meaning TEXT NOT NULL,
      actual_nuance TEXT NOT NULL,
      tone TEXT NOT NULL,
      formality TEXT NOT NULL CHECK(formality IN ('casual', 'neutral', 'formal')),
      is_slang INTEGER NOT NULL,
      usage_scene TEXT NOT NULL,
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
      user_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `)

  // indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON notes(notebook_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_context_objects_note_id ON context_objects(note_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_quizzes_context_object_id ON quizzes(context_object_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_quiz_runs_user_id ON quiz_runs(user_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_quiz_records_quiz_run_id ON quiz_records(quiz_run_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_quiz_records_quiz_id ON quiz_records(quiz_id)`)
}
