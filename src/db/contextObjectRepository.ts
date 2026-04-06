import { getDb } from '.'
import type { ContextObject } from '../types'

export const contextObjectRepository = {
  async findAll(): Promise<ContextObject[]> {
    const db = await getDb()
    const result = db.exec('SELECT * FROM context_objects')
    if (result.length === 0) return []
    return result[0].values.map(rowToContextObject)
  },

  async bulkInsert(contextObjects: ContextObject[]): Promise<void> {
    const db = await getDb()
    for (const co of contextObjects) {
      db.run(
        `INSERT OR REPLACE INTO context_objects
          (id, note_id, expression, base_meaning, actual_nuance, tone, formality, is_slang, usage_scene, example_dialogue, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          co.id, co.note_id, co.expression, co.base_meaning, co.actual_nuance,
          co.tone, co.formality, co.is_slang ? 1 : 0,
          JSON.stringify(co.usage_scene), JSON.stringify(co.example_dialogue),
          co.created_at, co.updated_at,
        ],
      )
    }
  },
}

function rowToContextObject(row: SqlValue[]): ContextObject {
  return {
    id: row[0] as string,
    note_id: row[1] as string,
    expression: row[2] as string,
    base_meaning: row[3] as string,
    actual_nuance: row[4] as string,
    tone: row[5] as string,
    formality: row[6] as ContextObject['formality'],
    is_slang: row[7] === 1,
    usage_scene: JSON.parse(row[8] as string),
    example_dialogue: JSON.parse(row[9] as string),
    created_at: row[10] as string,
    updated_at: row[11] as string,
  }
}

type SqlValue = string | number | null | Uint8Array
