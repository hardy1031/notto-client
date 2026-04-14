import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useSyncStatus } from '../hooks/useSyncContext'
import { useQuizReview, type ReviewItem } from '../hooks/useQuizReview'
import type { Quiz, QuizRecord } from '../types'
import './shared.css'
import './quiz-review.css'


function optionColor(opt: string, quiz: Quiz, record: QuizRecord): string {
  if (opt === quiz.answer) return '#9daad1'
  if (opt === record.user_answer && !record.is_correct) return '#ff7c7c'
  return '#e4e4e4'
}

function optionShadow(opt: string, quiz: Quiz): string {
  if (opt === quiz.answer) return '0 4px 12px rgba(119,163,214,0.45)'
  return 'none'
}

function QuestionPanel({ item }: { item: ReviewItem }) {
  const { quiz, record, contextObject } = item
  const options = record.choices

  return (
    <div className="quiz-review-left-panel">
      <p className="quiz-review-question-text">{quiz.question_sentence}</p>
      <p className="quiz-review-question-sub">
        {quiz.type === 'choose_context'
          ? 'Choose the expression that best fits the blank'
          : quiz.type === 'choose_pronunciation'
          ? 'Pick the word that sounds similar to the word in quotes'
          : 'Choose the correct answer'}
      </p>

      <div className="quiz-review-context-card">
        <div className="quiz-review-context-pins">
          <div className="quiz-review-context-pin" />
          <div className="quiz-review-context-pin" />
        </div>
        <div className="quiz-review-context-dialogue">
          {contextObject.example_dialogue.map((line, i) => {
            const isRight = line.speaker !== 'A'
            return (
              <div key={i} className={`quiz-review-bubble ${isRight ? 'quiz-review-bubble--right' : ''}`}>
                <div className="quiz-review-bubble-text">{line.text}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="quiz-review-options-grid">
        {options.map((opt) => (
          <button
            key={opt}
            className="quiz-review-option"
            style={{
              background: optionColor(opt, quiz, record),
              boxShadow: optionShadow(opt, quiz),
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ContextPanel({ contextObject }: { contextObject: ContextObject }) {
  return (
    <div className="quiz-review-right-panel">
      <div className="quiz-review-divider" />
      <div className="quiz-review-context-info">
        <h2 className="quiz-review-expression">{contextObject.expression}</h2>
        <div className="quiz-review-tags">
          <span className="quiz-review-tag">{contextObject.formality}</span>
          {contextObject.is_slang && <span className="quiz-review-tag">slang</span>}
        </div>

        <div className="quiz-review-section">
          <div className="quiz-review-section-label">Base Meaning</div>
          <div className="quiz-review-section-value">{contextObject.base_meaning}</div>
        </div>

        <div className="quiz-review-section">
          <div className="quiz-review-section-label">Actual Nuance</div>
          <div className="quiz-review-section-value">{contextObject.actual_nuance}</div>
        </div>

        <div className="quiz-review-section">
          <div className="quiz-review-section-label">Tone</div>
          <div className="quiz-review-section-value">{contextObject.tone}</div>
        </div>

        <div className="quiz-review-section">
          <div className="quiz-review-section-label">Example Dialogue</div>
          <div className="quiz-review-dialogue-box">
            {contextObject.example_dialogue.map((line, i) => {
              const isRight = line.speaker !== 'A'
              return (
                <div key={i} className={`quiz-review-info-bubble ${isRight ? 'quiz-review-info-bubble--right' : ''}`}>
                  <div className="quiz-review-info-bubble-text">{line.text}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function QuizReviewPage() {
  const { runId } = useParams<{ runId: string }>()
  const navigate = useNavigate()
  const syncStatus = useSyncStatus()
  const { items, loading } = useQuizReview(runId, syncStatus === 'done')
  const [currentIndex, setCurrentIndex] = useState(0)

  if (syncStatus === 'idle' || syncStatus === 'syncing' || loading) {
    return (
      <div className="page-root">
        <div className="quiz-review-loading">Loading review…</div>
      </div>
    )
  }

  if (syncStatus === 'error') {
    return (
      <div className="page-root">
        <div className="quiz-review-loading">
          <p>Failed to load data.</p>
          <button onClick={() => navigate('/quiz-history')}>Back</button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page-root">
        <div className="quiz-review-loading">
          <p>No data found for this quiz run.</p>
          <button onClick={() => navigate('/quiz-history')}>Back</button>
        </div>
      </div>
    )
  }

  const current = items[currentIndex]
  const total = items.length

  return (
    <div className="page-root">
      <PageHeader activePage="quiz-history" />

      {/* Main content with arrows */}
      <div className="quiz-review-main">
        {/* Left arrow */}
        <button
          className="quiz-review-arrow quiz-review-arrow--left"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          aria-label="Previous question"
        >
          ◁
        </button>

        {/* Panels */}
        <div className="quiz-review-panels">
          <QuestionPanel item={current} />
          <ContextPanel contextObject={current.contextObject} />
        </div>

        {/* Right arrow */}
        <button
          className="quiz-review-arrow quiz-review-arrow--right"
          onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
          disabled={currentIndex === total - 1}
          aria-label="Next question"
        >
          ▷
        </button>
      </div>

      {/* Pagination */}
      <div className="quiz-review-pagination">
        {items.map((_, i) => (
          <button
            key={i}
            className={`quiz-review-page-dot ${i === currentIndex ? 'quiz-review-page-dot--active' : ''}`}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Question ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
