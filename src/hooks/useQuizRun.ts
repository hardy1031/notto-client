import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { quizRepository } from '../db/quizRepository'
import { quizRunRepository } from '../db/quizRunRepository'
import { quizRecordRepository } from '../db/quizRecordRepository'
import { selectQuizzes } from '../domain/recommendation'
import type { Quiz, QuizRecord } from '../types'

const QUIZ_RUN_SIZE = 10

type RunStatus = 'loading' | 'in_progress' | 'finished'

interface PendingRecord {
  quiz_id: string
  user_answer: string
  is_correct: boolean
}

export function useQuizRun() {
  const [status, setStatus] = useState<RunStatus>('loading')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [records, setRecords] = useState<PendingRecord[]>([])
  const [startedAt] = useState(() => new Date().toISOString())
  const [runId] = useState(() => crypto.randomUUID())

  useEffect(() => {
    const load = async () => {
      const allQuizzes = await quizRepository.findAll()
      const allRecords = await quizRecordRepository.findAll()
      const selected = selectQuizzes(allQuizzes, allRecords, QUIZ_RUN_SIZE)
      setQuizzes(selected)
      setStatus('in_progress')
    }
    load()
  }, [])

  const submitAnswer = useCallback((userAnswer: string) => {
    const current = quizzes[currentIndex]
    const isCorrect = userAnswer.trim() === current.answer.trim()

    const record: PendingRecord = {
      quiz_id: current.id,
      user_answer: userAnswer,
      is_correct: isCorrect,
    }

    const updatedRecords = [...records, record]
    setRecords(updatedRecords)

    if (currentIndex + 1 >= quizzes.length) {
      finishRun(updatedRecords)
      setStatus('finished')
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }, [quizzes, currentIndex, records])

  const finishRun = useCallback(async (finalRecords: PendingRecord[]) => {
    const completedAt = new Date().toISOString()

    // save to local DB
    await quizRunRepository.insert({
      id: runId,
      user_id: 'mock-user-uuid',
      started_at: startedAt,
      completed_at: completedAt,
    })

    const quizRecords: QuizRecord[] = finalRecords.map((r, i) => ({
      id: crypto.randomUUID(),
      quiz_run_id: runId,
      quiz_id: r.quiz_id,
      user_answer: r.user_answer,
      is_correct: r.is_correct,
      created_at: new Date(Date.now() + i * 1000).toISOString(),
    }))
    await quizRecordRepository.bulkInsert(quizRecords)

    // fire-and-forget sync to server
    api.submitQuizRun({
      started_at: startedAt,
      completed_at: completedAt,
      records: finalRecords,
    }).catch(() => {
      // best-effort — local DB is source of truth
    })
  }, [runId, startedAt])

  return {
    status,
    currentQuiz: quizzes[currentIndex] ?? null,
    currentIndex,
    total: quizzes.length,
    records,
    submitAnswer,
  }
}
