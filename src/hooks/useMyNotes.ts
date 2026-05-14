import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { notebookRepository } from '../db/notebookRepository'
import { noteRepository, noteContentRepository } from '../db/noteRepository'
import type { Notebook, Note } from '../types'

export function useMyNotes(syncStatus: 'idle' | 'syncing' | 'done' | 'error') {
  const { user } = useAuth()
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')

  // Load notebooks from local DB immediately, then reload after sync completes
  useEffect(() => {
    notebookRepository.findAll().then(setNotebooks)
  }, [])

  useEffect(() => {
    if (syncStatus !== 'done') return
    notebookRepository.findAll().then(setNotebooks)
  }, [syncStatus])

  // Load notes when notebook selected
  useEffect(() => {
    if (!selectedNotebookId) {
      setNotes([])
      setSelectedNoteId(null)
      setContent('')
      return
    }
    noteRepository.findByNotebookId(selectedNotebookId).then(setNotes)
  }, [selectedNotebookId])

  // Load content when note selected
  useEffect(() => {
    if (!selectedNoteId) {
      setContent('')
      return
    }
    noteContentRepository.findByNoteId(selectedNoteId).then(c => setContent(c ?? ''))
  }, [selectedNoteId])

  const createNotebook = useCallback(async (name: string) => {
    const now = new Date().toISOString()
    const notebook: Notebook = {
      id: crypto.randomUUID(),
      user_id: user?.id ?? '',
      name,
      created_at: now,
      updated_at: now,
    }
    await notebookRepository.insert(notebook)
    setNotebooks(prev => [notebook, ...prev])
    setSelectedNotebookId(notebook.id)
  }, [])

  const createNote = useCallback(async (notebookId: string, name: string) => {
    const now = new Date().toISOString()
    const note: Note = {
      id: crypto.randomUUID(),
      notebook_id: notebookId,
      name,
      s3_key: '',
      created_at: now,
      updated_at: now,
    }
    await noteRepository.insert(note)
    await noteContentRepository.save(note.id, '')
    setNotes(prev => [note, ...prev])
    setSelectedNoteId(note.id)
    setContent('')
  }, [])

  const saveContent = useCallback(async (noteId: string, newContent: string) => {
    setContent(newContent)
    await noteContentRepository.save(noteId, newContent)
    const now = new Date().toISOString()
    await noteRepository.updateTimestamp(noteId, now)
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, updated_at: now } : n))
  }, [])

  return {
    notebooks,
    selectedNotebookId,
    setSelectedNotebookId,
    notes,
    selectedNoteId,
    setSelectedNoteId,
    content,
    createNotebook,
    createNote,
    saveContent,
  }
}
