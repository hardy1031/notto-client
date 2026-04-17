import { getDb, dbRun } from '.'
import type { QuizRecord } from '../types'

type SqlValue = string | number | null | Uint8Array

function rowToQuizRecord(row: SqlValue[]): QuizRecord {
  return {
    id: row[0] as string,
    quiz_run_id: row[1] as string,
    quiz_id: row[2] as string,
    choices: JSON.parse(row[3] as string),
    user_answer: row[4] as string,
    is_correct: row[5] === 1,
    created_at: row[6] as string,
  }
}

export const quizRecordRepository = {
  async findAll(): Promise<QuizRecord[]> {
    const db = await getDb()
    const result = db.exec('SELECT * FROM quiz_records')
    if (result.length === 0) return []
    return result[0].values.map(rowToQuizRecord)
  },

  async findByRunId(runId: string): Promise<QuizRecord[]> {
    const db = await getDb()
    const result = db.exec('SELECT * FROM quiz_records WHERE quiz_run_id = ?', [runId])
    if (result.length === 0) return []
    return result[0].values.map(rowToQuizRecord)
  },

  async findByQuizId(quizId: string): Promise<QuizRecord[]> {
    const db = await getDb()
    const result = db.exec('SELECT * FROM quiz_records WHERE quiz_id = ?', [quizId])
    if (result.length === 0) return []
    return result[0].values.map(rowToQuizRecord)
  },

  async bulkInsert(records: QuizRecord[]): Promise<void> {
    for (const record of records) {
      await dbRun(
        `INSERT OR REPLACE INTO quiz_records
          (id, quiz_run_id, quiz_id, choices, user_answer, is_correct, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [record.id, record.quiz_run_id, record.quiz_id, JSON.stringify(record.choices), record.user_answer, record.is_correct ? 1 : 0, record.created_at],
      )
    }
  },
}
