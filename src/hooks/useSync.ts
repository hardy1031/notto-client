import { useCallback, useState } from 'react'
import { api } from '../api'
import { contextObjectRepository } from '../db/contextObjectRepository'
import { quizRepository } from '../db/quizRepository'
import { quizRunRepository } from '../db/quizRunRepository'
import { quizRecordRepository } from '../db/quizRecordRepository'

type SyncStatus = 'idle' | 'syncing' | 'done' | 'error'

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>('idle')

  const sync = useCallback(async () => {
    setStatus('syncing')
    try {
      const data = await api.getMe()
      await contextObjectRepository.bulkInsert(data.context_objects)
      await quizRepository.bulkInsert(data.quizzes)
      for (const run of data.quiz_runs) {
        await quizRunRepository.insert(run)
      }
      await quizRecordRepository.bulkInsert(data.quiz_records)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }, [])

  return { sync, status }
}
