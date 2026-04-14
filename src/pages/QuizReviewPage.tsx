import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useSyncStatus } from '../hooks/useSyncContext'
import { useQuizReview, type ReviewItem } from '../hooks/useQuizReview'
import type { ContextObject, Quiz, QuizRecord } from '../types'
import './shared.css'
import './quiz-review.css'

function getReviewOptions(quiz: Quiz, allContextObjects: ContextObject[]): string[] {
  const correct = quiz.answer
  if (quiz.type === 'fill_metadata' && ['casual', 'neutral', 'formal'].includes(correct)) {
    return ['casual', 'neutral', 'formal']
  }
  const others = allContextObjects.map((co) => co.expression).filter((e) => e !== correct)
  return [correct, ...others.slice(0, 3)]
}

function optionColor(opt: string, quiz: Quiz, record: QuizRecord): string {
  if (opt === quiz.answer) return '#9daad1'
  if (opt === record.user_answer && !record.is_correct) return '#ff7c7c'
  return '#e4e4e4'
}

function optionShadow(opt: string, quiz: Quiz): string {
  if (opt === quiz.answer) return '0 4px 12px rgba(119,163,214,0.45)'
  return 'none'
}

function QuestionPanel({
  item,
  allContextObjects,
}: {
  item: ReviewItem
  allContextObjects: ContextObject[]
}) {
  const { quiz, record, contextObject } = item
  const options = getReviewOptions(quiz, allContextObjects)

  return (
    <div className="qr-left-panel">
      <p className="qr-question-text">{quiz.question_sentence}</p>
      <p className="qr-question-sub">
        {quiz.type === 'choose_context'
          ? 'Choose the expression that best fits the blank'
          : quiz.type === 'choose_pronunciation'
          ? 'Pick the word that sounds similar to the word in quotes'
          : 'Choose the correct answer'}
      </p>

      <div className="qr-context-card">
        <div className="qr-context-pins">
          <div className="qr-context-pin" />
          <div className="qr-context-pin" />
        </div>
        <div className="qr-context-dialogue">
          {contextObject.example_dialogue.map((line, i) => {
            const isRight = line.speaker !== 'A'
            return (
              <div key={i} className={`qr-bubble ${isRight ? 'qr-bubble--right' : ''}`}>
                <div className="qr-bubble-text">{line.text}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="qr-options-grid">
        {options.map((opt) => (
          <button
            key={opt}
            className="qr-option"
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
    <div className="qr-right-panel">
      <div className="qr-divider" />
      <div className="qr-context-info">
        <h2 className="qr-expression">{contextObject.expression}</h2>
        <div className="qr-tags">
          <span className="qr-tag">{contextObject.formality}</span>
          {contextObject.is_slang && <span className="qr-tag">slang</span>}
        </div>

        <div className="qr-section">
          <div className="qr-section-label">Base Meaning</div>
          <div className="qr-section-value">{contextObject.base_meaning}</div>
        </div>

        <div className="qr-section">
          <div className="qr-section-label">Actual Nuance</div>
          <div className="qr-section-value">{contextObject.actual_nuance}</div>
        </div>

        <div className="qr-section">
          <div className="qr-section-label">Tone</div>
          <div className="qr-section-value">{contextObject.tone}</div>
        </div>

        <div className="qr-section">
          <div className="qr-section-label">Example Dialogue</div>
          <div className="qr-dialogue-box">
            {contextObject.example_dialogue.map((line, i) => {
              const isRight = line.speaker !== 'A'
              return (
                <div key={i} className={`qr-info-bubble ${isRight ? 'qr-info-bubble--right' : ''}`}>
                  <div className="qr-info-bubble-text">{line.text}</div>
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
  const { items, allContextObjects, loading } = useQuizReview(runId, syncStatus === 'done')
  const [currentIndex, setCurrentIndex] = useState(0)

  if (syncStatus === 'idle' || syncStatus === 'syncing' || loading) {
    return (
      <div className="page-root">
        <div className="qr-loading">Loading review…</div>
      </div>
    )
  }

  if (syncStatus === 'error') {
    return (
      <div className="page-root">
        <div className="qr-loading">
          <p>Failed to load data.</p>
          <button onClick={() => navigate('/quiz-history')}>Back</button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page-root">
        <div className="qr-loading">
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
      <div className="qr-main">
        {/* Left arrow */}
        <button
          className="qr-arrow qr-arrow--left"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          aria-label="Previous question"
        >
          ◁
        </button>

        {/* Panels */}
        <div className="qr-panels">
          <QuestionPanel item={current} allContextObjects={allContextObjects} />
          <ContextPanel contextObject={current.contextObject} />
        </div>

        {/* Right arrow */}
        <button
          className="qr-arrow qr-arrow--right"
          onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
          disabled={currentIndex === total - 1}
          aria-label="Next question"
        >
          ▷
        </button>
      </div>

      {/* Pagination */}
      <div className="qr-pagination">
        {items.map((_, i) => (
          <button
            key={i}
            className={`qr-page-dot ${i === currentIndex ? 'qr-page-dot--active' : ''}`}
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
