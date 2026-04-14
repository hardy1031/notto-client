import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useSyncStatus } from '../hooks/useSyncContext'
import { useQuizHistory } from '../hooks/useQuizHistory'
import './shared.css'
import './quiz-history.css'

function formatDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, '/')
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins}mins ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}hrs ago`
  return `${Math.floor(hrs / 24)}days ago`
}

function ScoreBar({ correct, total }: { correct: number; total: number }) {
  const pct = total > 0 ? (correct / total) * 100 : 0
  return (
    <div className="qh-score-cell">
      <div className="qh-score-bar-wrap">
        <div className="qh-score-bar-fill" style={{ width: `${pct}%` }} />
        <div className="qh-score-bar-empty" />
      </div>
      <span className="qh-score-label">{correct}/{total}</span>
    </div>
  )
}

export function QuizHistoryPage() {
  const navigate = useNavigate()
  const syncStatus = useSyncStatus()
  const { rows } = useQuizHistory(syncStatus === 'done')

  return (
    <div className="page-root">
      <PageHeader activePage="quiz-history" />

      <div className="qh-title-area">
        <h1 className="qh-title">Review Daily Quiz</h1>
        <p className="qh-subtitle">Check your past quiz runs and review your answers</p>
      </div>

      <div className="qh-table-wrap">
        <table className="qh-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Score</th>
              <th>Run count</th>
              <th>Last played</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#9daad1', padding: '48px' }}>
                  No quiz history yet. Start practicing!
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const correct = row.records.filter((r) => r.is_correct).length
                const total = row.records.length
                return (
                  <tr key={row.run.id}>
                    <td>{formatDate(row.run.started_at)}</td>
                    <td><ScoreBar correct={correct} total={total} /></td>
                    <td>{total}</td>
                    <td>{timeAgo(row.run.started_at)}</td>
                    <td>
                      <div className="qh-actions">
                        <button
                          className="qh-btn"
                          onClick={() => navigate('/practice')}
                        >
                          Retry
                        </button>
                        <button
                          className="qh-btn"
                          onClick={() => navigate(`/quiz-review/${row.run.id}`)}
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
