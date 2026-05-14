import { getDb, dbRun } from '.'
import type { Notebook } from '../types'

type SqlValue = string | number | null | Uint8Array

function rowToNotebook(row: SqlValue[]): Notebook {
  return {
    id: row[0] as string,
    user_id: row[1] as string,
    name: row[2] as string,
    created_at: row[3] as string,
    updated_at: row[4] as string,
  }
}

export const notebookRepository = {
  async findAll(): Promise<Notebook[]> {
    const db = await getDb()
    const result = db.exec('SELECT * FROM notebooks ORDER BY created_at DESC')
    if (result.length === 0) return []
    return result[0].values.map(rowToNotebook)
  },

  async insert(notebook: Notebook): Promise<void> {
    await dbRun(
      `INSERT OR REPLACE INTO notebooks (id, user_id, name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [notebook.id, notebook.user_id, notebook.name, notebook.created_at, notebook.updated_at],
    )
  },

  async bulkInsert(notebooks: Notebook[]): Promise<void> {
    for (const nb of notebooks) await this.insert(nb)
  },
}
