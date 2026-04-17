import { useEffect, useState } from 'react'
import { quizRunRepository } from '../db/quizRunRepository'
import { quizRecordRepository } from '../db/quizRecordRepository'
import type { QuizRun, QuizRecord } from '../types'

export interface QuizHistoryRow {
  run: QuizRun
  records: QuizRecord[]
}

export function useQuizHistory(syncStatus: 'idle' | 'syncing' | 'done' | 'error') {
  const [rows, setRows] = useState<QuizHistoryRow[]>([])

  const load = async () => {
    const runs = await quizRunRepository.findAll()
    const withRecords = await Promise.all(
      runs.map(async (run) => ({
        run,
        records: await quizRecordRepository.findByRunId(run.id),
      }))
    )
    setRows(withRecords)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (syncStatus !== 'done') return
    load()
  }, [syncStatus])

  return { rows }
}
