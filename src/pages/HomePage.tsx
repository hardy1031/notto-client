import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import './shared.css'
import './home.css'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <PageHeader activePage="home" showNav={false} />

      {/* Top decorative section */}
      <div className="home-deco">
        <svg
          className="home-deco-triangle"
          viewBox="0 0 358 310"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="179,24 334,286 24,286"
            stroke="#e8eef8"
            strokeWidth="40"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
        <div className="home-deco-circle" />
      </div>

      {/* Bottom cards */}
      <div className="home-bottom">
        <div className="home-cards">
          {/* QUIZ card */}
          <div className="home-card" onClick={() => navigate('/practice')}>
            <div className="home-card-icon-circle" />
            <p className="home-card-title">Quiz</p>
            <p className="home-card-subtitle">Improve your language</p>
          </div>

          {/* QUIZ HISTORY card */}
          <div className="home-card" onClick={() => navigate('/quiz-history')}>
            <div className="home-card-icon-triangle-wrap">
              <div className="home-card-icon-triangle" />
            </div>
            <p className="home-card-title">Quiz History</p>
            <p className="home-card-subtitle">Improve your language</p>
          </div>

          {/* MY NOTE card */}
          <div className="home-card" onClick={() => navigate('/my-notes')}>
            <div className="home-card-icon-square" />
            <p className="home-card-title">My Note</p>
            <p className="home-card-subtitle">Improve your language</p>
          </div>
        </div>
      </div>
    </div>
  )
}
