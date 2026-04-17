import { getDb, dbRun } from '.'
import type { QuizRun } from '../types'

export const quizRunRepository = {
  async findAll(): Promise<QuizRun[]> {
    const db = await getDb()
    const result = db.exec('SELECT * FROM quiz_runs ORDER BY started_at DESC')
    if (result.length === 0) return []
    return result[0].values.map((row) => ({
      id: row[0] as string,
      user_id: row[1] as string,
      started_at: row[2] as string,
      completed_at: row[3] as string | null,
    }))
  },

  async insert(quizRun: QuizRun): Promise<void> {
    await dbRun(
      `INSERT OR REPLACE INTO quiz_runs (id, user_id, started_at, completed_at)
       VALUES (?, ?, ?, ?)`,
      [quizRun.id, quizRun.user_id, quizRun.started_at, quizRun.completed_at],
    )
  },

  async complete(id: string, completedAt: string): Promise<void> {
    await dbRun('UPDATE quiz_runs SET completed_at = ? WHERE id = ?', [completedAt, id])
  },
}
