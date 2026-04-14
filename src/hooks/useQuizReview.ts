import { useEffect, useState } from 'react'
import { quizRecordRepository } from '../db/quizRecordRepository'
import { quizRepository } from '../db/quizRepository'
import { contextObjectRepository } from '../db/contextObjectRepository'
import type { ContextObject, Quiz, QuizRecord } from '../types'

export interface ReviewItem {
  record: QuizRecord
  quiz: Quiz
  contextObject: ContextObject
}

export function useQuizReview(runId: string | undefined, syncDone: boolean) {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [allContextObjects, setAllContextObjects] = useState<ContextObject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!syncDone) return
    const load = async () => {
      const [records, allQuizzes, allCOs] = await Promise.all([
        quizRecordRepository.findByRunId(runId ?? ''),
        quizRepository.findAll(),
        contextObjectRepository.findAll(),
      ])
      setAllContextObjects(allCOs)
      const built: ReviewItem[] = []
      for (const record of records) {
        const quiz = allQuizzes.find((q) => q.id === record.quiz_id)
        if (!quiz) continue
        const co = allCOs.find((c) => c.id === quiz.context_object_id)
        if (!co) continue
        built.push({ record, quiz, contextObject: co })
      }
      setItems(built)
      setLoading(false)
    }
    load()
  }, [syncDone, runId])

  return { items, allContextObjects, loading }
}
