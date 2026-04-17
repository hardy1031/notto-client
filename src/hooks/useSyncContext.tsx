import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useQuizDataSync } from './useQuizDataSync'

type SyncStatus = 'idle' | 'syncing' | 'done' | 'error'

const SyncContext = createContext<SyncStatus>('idle')

export function SyncProvider({ children }: { children: ReactNode }) {
  const { sync, status } = useQuizDataSync()

  useEffect(() => {
    sync()
  }, [])

  return <SyncContext.Provider value={status}>{children}</SyncContext.Provider>
}

export function useSyncStatus(): SyncStatus {
  return useContext(SyncContext)
}
