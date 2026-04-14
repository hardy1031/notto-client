import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useSync } from './useSync'

type SyncStatus = 'idle' | 'syncing' | 'done' | 'error'

const SyncContext = createContext<SyncStatus>('idle')

export function SyncProvider({ children }: { children: ReactNode }) {
  const { sync, status } = useSync()

  useEffect(() => {
    sync()
  }, [])

  return <SyncContext.Provider value={status}>{children}</SyncContext.Provider>
}

export function useSyncStatus(): SyncStatus {
  return useContext(SyncContext)
}
