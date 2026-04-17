import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useSyncStatus } from '../hooks/useSyncContext'
import { useMyNotes } from '../hooks/useMyNotes'
import { noteRepository, noteContentRepository } from '../db/noteRepository'
import { notebookRepository } from '../db/notebookRepository'
import { contextObjectRepository } from '../db/contextObjectRepository'
import { quizRepository } from '../db/quizRepository'
import { api } from '../api'
import './shared.css'
import './my-notes.css'

type Row = { expression: string; annotation: string }

function parseNoteContent(content: string): Row[] {
  const rows: Row[] = []
  for (const line of content.split('\n')) {
    if (!line.startsWith('- ')) continue
    const rest = line.slice(2)
    const sep = rest.indexOf(' :: ')
    if (sep !== -1) {
      rows.push({ expression: rest.slice(0, sep), annotation: rest.slice(sep + 4) })
    } else if (rest.trim()) {
      rows.push({ expression: rest, annotation: '' })
    }
  }
  return rows
}

function serializeNoteContent(noteId: string, rows: Row[]): string {
  const filled = rows.filter(r => r.expression.trim() || r.annotation.trim())
  if (filled.length === 0) return ''
  return `@note ${noteId}\n\n${filled.map(r => `- ${r.expression} :: ${r.annotation}`).join('\n')}`
}

function ensureTrailingEmpties(rows: Row[], count = 3): Row[] {
  const result = [...rows]
  let trailing = 0
  for (let i = result.length - 1; i >= 0; i--) {
    if (!result[i].expression.trim() && !result[i].annotation.trim()) trailing++
    else break
  }
  while (trailing < count) {
    result.push({ expression: '', annotation: '' })
    trailing++
  }
  return result
}

export function MyNotesPage() {
  const navigate = useNavigate()
  const syncStatus = useSyncStatus()
  const {
    notebooks,
    selectedNotebookId,
    setSelectedNotebookId,
    notes,
    selectedNoteId,
    setSelectedNoteId,
    createNotebook,
    createNote,
    saveContent,
  } = useMyNotes(syncStatus)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [addingNotebook, setAddingNotebook] = useState(false)
  const [newNotebookName, setNewNotebookName] = useState('')
  const [addingNoteForNotebookId, setAddingNoteForNotebookId] = useState<string | null>(null)
  const [newNoteName, setNewNoteName] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [generating, setGenerating] = useState(false)
  const newNotebookInputRef = useRef<HTMLInputElement>(null)
  const newNoteInputRef = useRef<HTMLInputElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (addingNotebook) newNotebookInputRef.current?.focus()
  }, [addingNotebook])

  useEffect(() => {
    if (addingNoteForNotebookId) newNoteInputRef.current?.focus()
  }, [addingNoteForNotebookId])

  useEffect(() => {
    if (!selectedNoteId) { setRows([]); return }
    noteContentRepository.findByNoteId(selectedNoteId).then(c => {
      setRows(ensureTrailingEmpties(parseNoteContent(c ?? '')))
    })
  }, [selectedNoteId])

  const handleNotebookSubmit = async () => {
    const name = newNotebookName.trim()
    if (!name) { setAddingNotebook(false); return }
    await createNotebook(name)
    setNewNotebookName('')
    setAddingNotebook(false)
  }

  const handleNoteSubmit = async () => {
    const name = newNoteName.trim()
    if (!name || !addingNoteForNotebookId) { setAddingNoteForNotebookId(null); setNewNoteName(''); return }
    await createNote(addingNoteForNotebookId, name)
    setNewNoteName('')
    setAddingNoteForNotebookId(null)
  }

  const handleGenerateQuiz = async () => {
    setGenerating(true)
    try {
      const [allNotebooks, allNotes] = await Promise.all([
        notebookRepository.findAll(),
        noteRepository.findAll(),
      ])
      const notesWithContent = await Promise.all(
        allNotes.map(async note => ({
          id: note.id,
          notebook_id: note.notebook_id,
          name: note.name,
          content: (await noteContentRepository.findByNoteId(note.id)) ?? '',
          created_at: note.created_at,
          updated_at: note.updated_at,
        })),
      )
      const notebookSync = await api.syncNotebooks({
        notebooks: allNotebooks.map(({ id, name, created_at, updated_at }) => ({ id, name, created_at, updated_at })),
        notes: notesWithContent,
      })
      await notebookRepository.bulkInsert(notebookSync.notebooks)
      await noteRepository.bulkInsert(notebookSync.notes)

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

      navigate('/practice')
    } catch (e) {
      console.error('[generateQuiz] failed:', e)
    } finally {
      setGenerating(false)
    }
  }

  const handleRowChange = (index: number, field: 'expression' | 'annotation', value: string) => {
    if (!selectedNoteId) return
    const updated = rows.map((r, i) => i === index ? { ...r, [field]: value } : r)
    const withTrailing = ensureTrailingEmpties(updated)
    setRows(withTrailing)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveContent(selectedNoteId, serializeNoteContent(selectedNoteId, withTrailing))
    }, 800)
  }

  return (
    <div className="notes-page">
      {syncStatus === 'syncing' && (
        <div className="sync-banner sync-banner--syncing">Syncing…</div>
      )}
      {syncStatus === 'error' && (
        <div className="sync-banner sync-banner--error">Sync failed. Please check your network connection.</div>
      )}

      <PageHeader activePage="my-notes" />

      {/* Hamburger toggle */}
      <button className="notes-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="20" height="2" rx="1" fill="#213163" />
          <rect y="6" width="20" height="2" rx="1" fill="#213163" />
          <rect y="12" width="20" height="2" rx="1" fill="#213163" />
        </svg>
      </button>

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="notes-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`notes-sidebar${sidebarOpen ? ' notes-sidebar--open' : ''}`}>
        <div className="notes-sidebar-header">
          <button className="notes-sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">✕</button>
        </div>

        <div className="notes-sidebar-divider" />

        <div className="notes-sidebar-user">
          <div className="notes-sidebar-icon" />
          <div>
            <p className="notes-sidebar-name">Ayato Hardy</p>
            <p className="notes-sidebar-sub">My Notebooks</p>
          </div>
        </div>

        <div className="notes-sidebar-divider" />

        {/* Notebooks section header */}
        <div className="notes-sidebar-section">
          <p className="notes-sidebar-title">Notebooks</p>
          <button className="notes-sidebar-add-btn" onClick={() => setAddingNotebook(true)} aria-label="Add notebook">+</button>
        </div>

        {/* New notebook input */}
        {addingNotebook && (
          <div className="notes-sidebar-new-input-wrap">
            <input
              ref={newNotebookInputRef}
              className="notes-sidebar-new-input"
              value={newNotebookName}
              onChange={e => setNewNotebookName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleNotebookSubmit()
                if (e.key === 'Escape') { setAddingNotebook(false); setNewNotebookName('') }
              }}
              onBlur={handleNotebookSubmit}
              placeholder="Notebook name"
            />
          </div>
        )}

        {/* Notebook list */}
        <div className="notes-sidebar-list">
          {notebooks.length === 0 && !addingNotebook && (
            <p className="notes-sidebar-empty">No notebooks yet</p>
          )}
          {notebooks.map(nb => (
            <div key={nb.id}>
              <div
                className={`notes-sidebar-item${selectedNotebookId === nb.id ? ' notes-sidebar-item--active' : ''}`}
                onClick={() => setSelectedNotebookId(nb.id)}
              >
                <span className="notes-sidebar-item-name">{nb.name}</span>
                <button
                  className="notes-sidebar-note-add-btn"
                  onClick={e => { e.stopPropagation(); setSelectedNotebookId(nb.id); setAddingNoteForNotebookId(nb.id) }}
                  aria-label="Add note"
                >+</button>
              </div>

              {/* Note name input */}
              {addingNoteForNotebookId === nb.id && (
                <div className="notes-sidebar-new-input-wrap">
                  <input
                    ref={newNoteInputRef}
                    className="notes-sidebar-new-input"
                    value={newNoteName}
                    onChange={e => setNewNoteName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleNoteSubmit()
                      if (e.key === 'Escape') { setAddingNoteForNotebookId(null); setNewNoteName('') }
                    }}
                    placeholder="Note name"
                  />
                </div>
              )}

              {/* Notes under selected notebook */}
              {selectedNotebookId === nb.id && notes.map(note => (
                <div
                  key={note.id}
                  className={`notes-sidebar-note-item${selectedNoteId === note.id ? ' notes-sidebar-note-item--active' : ''}`}
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <span className="notes-sidebar-note-date">{note.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="notes-main">
        <div className="notes-paper-stack">
          <div className="notes-paper-back2" />
          <div className="notes-paper-back1" />
          <div className="notes-paper-front">
            {selectedNoteId ? (
              <div className="note-rows-container">
                <div className="note-row note-row--header">
                  <span className="note-row-header-cell note-row-header-cell--expression">expression</span>
                  <span className="note-row-separator">|</span>
                  <span className="note-row-header-cell note-row-header-cell--annotation">annotation</span>
                </div>
                {rows.map((row, i) => (
                  <div key={i} className="note-row">
                    <input
                      className="note-row-input note-row-input--expression"
                      value={row.expression}
                      onChange={e => handleRowChange(i, 'expression', e.target.value)}
                    />
                    <span className="note-row-separator">|</span>
                    <input
                      className="note-row-input note-row-input--annotation"
                      value={row.annotation}
                      onChange={e => handleRowChange(i, 'annotation', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="notes-paper-placeholder">
                {selectedNotebookId ? 'Select or create a note' : 'Select a notebook'}
              </p>
            )}
          </div>
        </div>
        <div className="notes-actions">
          <button className="notes-generate-btn" onClick={handleGenerateQuiz} disabled={generating}>
            {generating ? 'Generating…' : 'Generate Quiz'}
          </button>
          <button className="notes-view-btn">
            <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path
                d="M1 9C1 9 3.5 4 9 4C14.5 4 17 9 17 9C17 9 14.5 14 9 14C3.5 14 1 9 1 9Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
              <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
