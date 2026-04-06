import { getDb } from '.'
import type { QuizRun } from '../types'

export const quizRunRepository = {
  async insert(quizRun: QuizRun): Promise<void> {
    const db = await getDb()
    db.run(
      `INSERT INTO quiz_runs (id, user_id, started_at, completed_at)
       VALUES (?, ?, ?, ?)`,
      [quizRun.id, quizRun.user_id, quizRun.started_at, quizRun.completed_at],
    )
  },

  async complete(id: string, completedAt: string): Promise<void> {
    const db = await getDb()
    db.run('UPDATE quiz_runs SET completed_at = ? WHERE id = ?', [completedAt, id])
  },
}
