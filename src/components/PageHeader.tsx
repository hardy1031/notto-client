import { useNavigate } from 'react-router-dom'
import '../pages/shared.css'

type ActivePage = 'home' | 'quiz-history' | 'my-notes' | 'practice'

interface Props {
  activePage?: ActivePage
  showNav?: boolean
}

export function PageHeader({ activePage, showNav = true }: Props) {
  const navigate = useNavigate()

  return (
    <header className="page-header">
      <div className="page-logo" onClick={() => navigate('/home')}>
        <span className="page-logo-slash">/</span>
        <span className="page-logo-name">NOTTO</span>
      </div>
      {showNav && (
        <nav className="page-nav">
          <button
            className={`page-nav-btn${activePage === 'home' ? ' page-nav-btn--active' : ''}`}
            onClick={() => navigate('/home')}
          >
            Home
          </button>
          <button
            className={`page-nav-btn${activePage === 'quiz-history' ? ' page-nav-btn--active' : ''}`}
            onClick={() => navigate('/quiz-history')}
          >
            Quiz History
          </button>
          <button
            className={`page-nav-btn${activePage === 'my-notes' ? ' page-nav-btn--active' : ''}`}
            onClick={() => navigate('/my-notes')}
          >
            My Note
          </button>
        </nav>
      )}
      <div className="page-user">
        <span className="page-user-name">AYATO HARDY</span>
        <div className="page-user-avatar" />
      </div>
    </header>
  )
}
