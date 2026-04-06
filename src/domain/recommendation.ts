import type { Quiz, QuizRecord } from '../types'

/**
 * Select quizzes for a run, prioritizing frequently missed items.
 * Falls back to recently added quizzes when there is no history.
 *
 * MVP: simple miss-rate sort. Production: full spaced repetition.
 */
export function selectQuizzes(
  quizzes: Quiz[],
  records: QuizRecord[],
  count: number,
): Quiz[] {
  const missCountByQuizId = new Map<string, number>()
  for (const record of records) {
    if (!record.is_correct) {
      missCountByQuizId.set(record.quiz_id, (missCountByQuizId.get(record.quiz_id) ?? 0) + 1)
    }
  }

  const sorted = [...quizzes].sort((a, b) => {
    const missA = missCountByQuizId.get(a.id) ?? 0
    const missB = missCountByQuizId.get(b.id) ?? 0
    if (missB !== missA) return missB - missA
    // fallback: recently added first
    return b.created_at.localeCompare(a.created_at)
  })

  return sorted.slice(0, count)
}
