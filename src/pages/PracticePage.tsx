import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useQuizRun } from '../hooks/useQuizRun'
import { useSyncStatus } from '../hooks/useSyncContext'
import type { ContextObject, Quiz } from '../types'
import './shared.css'
import './practice.css'



function quizTypeLabel(quiz: Quiz): string {
  switch (quiz.type) {
    case 'choose_context':
      return 'Choose the expression that best fits the blank'
    case 'choose_pronunciation':
      return 'Pick the word that sounds similar to the word in quotes'
    case 'fill_metadata':
      return 'Choose the correct answer'
  }
}

// Progress ring SVG
function ProgressRing({ current, total }: { current: number; total: number }) {
  const r = 30
  const circumference = 2 * Math.PI * r
  const progress = total > 0 ? current / total : 0
  const offset = circumference * (1 - progress)

  return (
    <div className="quiz-progress-ring">
      <div className="quiz-progress-inner">
        {current}/{total}
      </div>
      <svg viewBox="0 0 68 68" fill="none">
        <circle
          cx="34"
          cy="34"
          r={r}
          stroke="#e2e8f0"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="34"
          cy="34"
          r={r}
          stroke="#adccf0"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 34 34)"
          style={{ transition: 'stroke-dashoffset 0.3s' }}
        />
      </svg>
    </div>
  )
}

function ContextCard({ contextObject, blankText }: { contextObject: ContextObject; blankText: string | null }) {
  return (
    <div className="context-card">
      <div className="context-pins">
        <div className="context-pin" />
        <div className="context-pin" />
      </div>
      <div className="context-quote">
        &quot;{blankText ?? '　　　　'}&quot;
      </div>
      <table className="context-table">
        <tbody>
          <tr>
            <td>Base meaning</td>
            <td>{contextObject.base_meaning}</td>
          </tr>
          <tr>
            <td>Tone</td>
            <td>{contextObject.tone}</td>
          </tr>
          <tr>
            <td>Actual nuance</td>
            <td>{contextObject.actual_nuance}</td>
          </tr>
        </tbody>
      </table>
      <div className="context-dialogue">
        {contextObject.example_dialogue.map((line, i) => {
          const isLast = i === contextObject.example_dialogue.length - 1
          const isRight = line.speaker !== 'A'
          return (
            <div
              key={i}
              className={`dialogue-bubble ${isRight ? 'dialogue-bubble--right' : ''} ${isLast && blankText === null ? 'dialogue-bubble--blank' : ''}`}
            >
              <div className="dialogue-bubble-avatar" />
              <div className="dialogue-bubble-text">
                {isLast && blankText === null ? '　　　　　　' : line.text}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function QuizSession() {
  const navigate = useNavigate()
  const { status, currentQuiz, currentContextObject, currentIndex, total, records, submitAnswer } = useQuizRun()
  const [selected, setSelected] = useState<string | null>(null)

  const options = useMemo(() => {
    if (!currentQuiz) return []
    return [...currentQuiz.choice_pool].sort(() => Math.random() - 0.5).slice(0, 4)
  }, [currentQuiz?.id])

  const handleSubmit = () => {
    if (!selected || !currentQuiz) return
    submitAnswer(selected, options)
    setSelected(null)
  }

  if (status === 'loading') {
    return <div className="practice-loading"><p>Loading quizzes…</p></div>
  }

  if (status === 'finished') {
    const correct = records.filter((r) => r.is_correct).length
    return (
      <div className="practice-finished">
        <h1>Nice work!</h1>
        <p className="score">{correct} / {records.length} correct</p>
        <button onClick={() => navigate('/home')}>Back to Home</button>
      </div>
    )
  }

  if (!currentQuiz) return null

  return (
    <div className="page-root">
      <PageHeader activePage="practice" />
      <main className="practice-main">
        {currentContextObject && (
          <ContextCard
            contextObject={currentContextObject}
            blankText={selected}
          />
        )}
        <div className="quiz-panel">
          <ProgressRing current={currentIndex + 1} total={total} />
          <div className="quiz-type-label">{quizTypeLabel(currentQuiz)}</div>
          <p className="quiz-question">{currentQuiz.question_sentence}</p>
          <div className="quiz-options">
            {options.map((opt) => (
              <button
                key={opt}
                className={`quiz-option${selected === opt ? ' quiz-option--selected' : ''}`}
                onClick={() => setSelected(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            className={`quiz-submit${selected ? ' quiz-submit--active' : ''}`}
            onClick={handleSubmit}
            disabled={!selected}
          >
            Submit
          </button>
        </div>
      </main>
    </div>
  )
}

export function PracticePage() {
  const syncStatus = useSyncStatus()

  if (syncStatus === 'idle' || syncStatus === 'syncing') {
    return (
      <div className="practice-loading">
        <p>Preparing your quiz…</p>
      </div>
    )
  }

  if (syncStatus === 'error') {
    return (
      <div className="practice-error">
        <p>Failed to load quiz data. Please try again.</p>
      </div>
    )
  }

  return <QuizSession />
}
