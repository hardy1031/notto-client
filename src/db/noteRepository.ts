import { getDb, dbRun } from '.'
import type { Note } from '../types'

type SqlValue = string | number | null | Uint8Array

function rowToNote(row: SqlValue[]): Note {
  return {
    id: row[0] as string,
    notebook_id: row[1] as string,
    name: row[2] as string,
    s3_key: row[3] as string,
    created_at: row[4] as string,
    updated_at: row[5] as string,
  }
}

export const noteRepository = {
  async findAll(): Promise<Note[]> {
    const db = await getDb()
    const result = db.exec(
      'SELECT id, notebook_id, name, s3_key, created_at, updated_at FROM notes ORDER BY created_at DESC',
    )
    if (result.length === 0) return []
    return result[0].values.map(rowToNote)
  },

  async findByNotebookId(notebookId: string): Promise<Note[]> {
    const db = await getDb()
    const result = db.exec(
      'SELECT id, notebook_id, name, s3_key, created_at, updated_at FROM notes WHERE notebook_id = ? ORDER BY created_at DESC',
      [notebookId],
    )
    if (result.length === 0) return []
    return result[0].values.map(rowToNote)
  },

  async insert(note: Note): Promise<void> {
    await dbRun(
      `INSERT OR REPLACE INTO notes (id, notebook_id, name, s3_key, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [note.id, note.notebook_id, note.name ?? '', note.s3_key ?? '', note.created_at, note.updated_at],
    )
  },

  async bulkInsert(notes: Note[]): Promise<void> {
    for (const note of notes) await this.insert(note)
  },

  async updateTimestamp(noteId: string, updatedAt: string): Promise<void> {
    await dbRun('UPDATE notes SET updated_at = ? WHERE id = ?', [updatedAt, noteId])
  },
}

export const noteContentRepository = {
  async findByNoteId(noteId: string): Promise<string | null> {
    const db = await getDb()
    const result = db.exec('SELECT content FROM note_contents WHERE note_id = ?', [noteId])
    if (result.length === 0 || result[0].values.length === 0) return null
    return result[0].values[0][0] as string
  },

  async save(noteId: string, content: string): Promise<void> {
    await dbRun(
      'INSERT OR REPLACE INTO note_contents (note_id, content) VALUES (?, ?)',
      [noteId, content],
    )
  },
}
