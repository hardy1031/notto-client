import { useCallback, useState } from 'react'
import { api } from '../api'
import { notebookRepository } from '../db/notebookRepository'
import { noteRepository, noteContentRepository } from '../db/noteRepository'
import { contextObjectRepository } from '../db/contextObjectRepository'
import { quizRepository } from '../db/quizRepository'
import { quizRunRepository } from '../db/quizRunRepository'
import { quizRecordRepository } from '../db/quizRecordRepository'

type SyncStatus = 'idle' | 'syncing' | 'done' | 'error'

export function useQuizDataSync() {
  const [status, setStatus] = useState<SyncStatus>('idle')

  const sync = useCallback(async () => {
    setStatus('syncing')
    try {
      // 1. Sync notebooks and notes
      const [notebooks, notes] = await Promise.all([
        notebookRepository.findAll(),
        noteRepository.findAll(),
      ])
      const notesWithContent = await Promise.all(
        notes.map(async note => ({
          id: note.id,
          notebook_id: note.notebook_id,
          name: note.name,
          content: (await noteContentRepository.findByNoteId(note.id)) ?? '',
          created_at: note.created_at,
          updated_at: note.updated_at,
        })),
      )
      const notebookSync = await api.syncNotebooks({
        notebooks: notebooks.map(({ id, name, created_at, updated_at }) => ({ id, name, created_at, updated_at })),
        notes: notesWithContent,
      })
      await notebookRepository.bulkInsert(notebookSync.notebooks)
      await noteRepository.bulkInsert(notebookSync.notes)

      // 2. Sync quizzes (context objects + quizzes)
      const [existingContextObjects, existingQuizzes] = await Promise.all([
        contextObjectRepository.findAll(),
        quizRepository.findAll(),
      ])
      const quizSync = await api.syncQuizzes({
        context_object_ids: existingContextObjects.map(co => co.id),
        quiz_ids: existingQuizzes.map(q => q.id),
      })
      await contextObjectRepository.bulkInsert(quizSync.context_objects)
      await quizRepository.bulkInsert(quizSync.quizzes)

      // 3. Sync quiz runs
      const existingRuns = await quizRunRepository.findAll()
      const runsWithRecords = await Promise.all(
        existingRuns.map(async run => ({
          id: run.id,
          started_at: run.started_at,
          completed_at: run.completed_at,
          records: await quizRecordRepository.findByRunId(run.id),
        })),
      )
      const quizRunSync = await api.syncQuizRuns({ quiz_runs: runsWithRecords })
      for (const run of quizRunSync.quiz_runs) {
        await quizRunRepository.insert(run)
        await quizRecordRepository.bulkInsert(run.records)
      }

      setStatus('done')
    } catch (e) {
      console.error('[useQuizDataSync] sync failed:', e)
      setStatus('error')
    }
  }, [])

  return { sync, status }
}
