import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './shared.css'
import './my-notes.css'

interface QuizRunItem {
  id: string
  name: string
  date: string
  completed: boolean
}

const MOCK_QUIZ_RUNS: QuizRunItem[] = [
  { id: '1', name: 'Korean Basics #1', date: 'Apr 10', completed: true },
  { id: '2', name: 'Daily Expressions', date: 'Apr 9', completed: true },
  { id: '3', name: 'Formal Speech Set', date: 'Apr 7', completed: false },
  { id: '4', name: 'Slang & Casual', date: 'Apr 5', completed: true },
  { id: '5', name: 'Business Korean', date: 'Apr 3', completed: false },
  { id: '6', name: 'Korean Basics #2', date: 'Mar 30', completed: true },
]

export function MyNotesPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="notes-page">
      {/* Top bar: nav + user (no logo — sidebar has its own) */}
      <div className={`notes-top-bar${sidebarOpen ? ' notes-top-bar--sidebar-open' : ''}`}>
        <button className="notes-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="2" rx="1" fill="#213163" />
            <rect y="6" width="20" height="2" rx="1" fill="#213163" />
            <rect y="12" width="20" height="2" rx="1" fill="#213163" />
          </svg>
        </button>
        <nav className="page-nav">
          <button className="page-nav-btn" onClick={() => navigate('/home')}>Home</button>
          <button className="page-nav-btn" onClick={() => navigate('/quiz-history')}>Quiz History</button>
          <button className="page-nav-btn page-nav-btn--active">My Note</button>
        </nav>
        <div className="page-user">
          <span className="page-user-name">AYATO HARDY</span>
          <div className="page-user-avatar" />
        </div>
      </div>

      {/* Sidebar: absolute, full height, own logo */}
      <aside className={`notes-sidebar${sidebarOpen ? ' notes-sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="notes-sidebar-logo" onClick={() => navigate('/home')}>
          <span className="page-logo-slash">/</span>
          <span className="page-logo-name">nOTTO</span>
        </div>

        <div className="notes-sidebar-divider" />

        {/* User info */}
        <div className="notes-sidebar-user">
          <div className="notes-sidebar-icon" />
          <div>
            <p className="notes-sidebar-name">Ayato Hardy</p>
            <p className="notes-sidebar-sub">Blah Blah Blah Blah Blah</p>
          </div>
        </div>

        <div className="notes-sidebar-divider" />

        {/* Section header */}
        <div className="notes-sidebar-section">
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="2" rx="1" fill="#213163" />
            <rect y="6" width="20" height="2" rx="1" fill="#213163" />
            <rect y="12" width="20" height="2" rx="1" fill="#213163" />
          </svg>
          <p className="notes-sidebar-title">Quiz History</p>
        </div>

        {/* Search bar */}
        <div className="notes-sidebar-search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="5" stroke="#9daad1" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="#9daad1" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="notes-sidebar-search-text">Search</span>
        </div>

        {/* List */}
        <div className="notes-sidebar-list">
          {MOCK_QUIZ_RUNS.map((item, i) => (
            <div
              key={item.id}
              className={`notes-sidebar-item${i === 0 ? ' notes-sidebar-item--active' : ''}`}
            >
              <span className="notes-sidebar-item-name">{item.name}</span>
              <span className="notes-sidebar-item-date">{item.date}</span>
              <span
                className={`notes-sidebar-item-check${item.completed ? ' notes-sidebar-item-check--done' : ''}`}
              >
                ✓
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className={`notes-main${sidebarOpen ? ' notes-main--sidebar-open' : ''}`}>
        <div className="notes-paper-stack">
          <div className="notes-paper-back2" />
          <div className="notes-paper-back1" />
          <div className="notes-paper-front">
            <p className="notes-paper-placeholder">Write down your note</p>
          </div>
        </div>
        <div className="notes-actions">
          <button className="notes-generate-btn">Generate</button>
          <button className="notes-view-btn">
            <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path
                d="M1 9C1 9 3.5 4 9 4C14.5 4 17 9 17 9C17 9 14.5 14 9 14C3.5 14 1 9 1 9Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
