import { useCallback, useState } from 'react'
import { api } from '../api'
import { contextObjectRepository } from '../db/contextObjectRepository'
import { quizRepository } from '../db/quizRepository'

type GenerateStatus = 'idle' | 'generating' | 'done' | 'error'

export function useGenerate() {
  const [status, setStatus] = useState<GenerateStatus>('idle')

  const generate = useCallback(async () => {
    setStatus('generating')
    try {
      const data = await api.generate()
      for (const item of data.generated) {
        await contextObjectRepository.bulkInsert([item.context_object])
        await quizRepository.bulkInsert(item.quizzes)
      }
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }, [])

  return { generate, status }
}
