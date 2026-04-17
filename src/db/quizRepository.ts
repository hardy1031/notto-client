import { getDb, dbRun } from '.'
import type { Quiz } from '../types'

type SqlValue = string | number | null | Uint8Array

function rowToQuiz(row: SqlValue[]): Quiz {
  return {
    id: row[0] as string,
    context_object_id: row[1] as string,
    type: row[2] as Quiz['type'],
    question_sentence: row[3] as string,
    answer: row[4] as string,
    choice_pool: JSON.parse(row[5] as string),
    created_at: row[6] as string,
    updated_at: row[7] as string,
  }
}

export const quizRepository = {
  async findAll(): Promise<Quiz[]> {
    const db = await getDb()
    const result = db.exec('SELECT * FROM quizzes')
    if (result.length === 0) return []
    return result[0].values.map(rowToQuiz)
  },

  async bulkInsert(quizzes: Quiz[]): Promise<void> {
    for (const quiz of quizzes) {
      await dbRun(
        `INSERT OR REPLACE INTO quizzes
          (id, context_object_id, type, question_sentence, answer, choice_pool, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [quiz.id, quiz.context_object_id, quiz.type, quiz.question_sentence, quiz.answer, JSON.stringify(quiz.choice_pool), quiz.created_at, quiz.updated_at],
      )
    }
  },
}
