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
      const [contextObjects, quizRuns] = await Promise.all([
        api.getContextObjects(),
        api.getQuizRuns(),
      ])

      for (const contextObject of contextObjects) {
        await contextObjectRepository.bulkInsert([contextObject])
        await quizRepository.bulkInsert(contextObject.quizzes)
      }

      for (const quizRun of quizRuns) {
        await quizRunRepository.insert(quizRun)
        await quizRecordRepository.bulkInsert(quizRun.records)
      }

      setStatus('done')
    } catch (e) {
      console.error('[useSync] sync failed:', e)
      setStatus('error')
    }
  }, [])

  return { sync, status }
}
