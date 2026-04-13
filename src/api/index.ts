import { apiClient } from './client'
import type { User, Notebook, Note, ContextObject, Quiz, QuizRun, QuizRecord } from '../types'

export interface SyncResponse {
  notebooks: Notebook[]
  notes: Note[]
  context_objects: ContextObject[]
  quizzes: Quiz[]
  quiz_runs: QuizRun[]
  quiz_records: QuizRecord[]
}

export interface InterpretResponse {
  generated: {
    context_object: ContextObject
    quizzes: Quiz[]
  }[]
}

export interface QuizRunResponse {
  quiz_run: QuizRun
  quiz_records: QuizRecord[]
}

export const api = {
  sync: (body: {
    notebooks: Notebook[]
    notes: Note[]
    quiz_runs: QuizRun[]
  }) => apiClient.post<SyncResponse>('/sync', body),

  interpret: () => apiClient.post<InterpretResponse>('/interpret'),

  getUser: () => apiClient.get<{ user: User }>('/auth/me'),

  submitQuizRun: (body: {
    started_at: string
    completed_at: string | null
    records: { quiz_id: string; user_answer: string; is_correct: boolean }[]
  }) => apiClient.post<QuizRunResponse>('/quiz-runs', body),
}
