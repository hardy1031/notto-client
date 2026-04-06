import { apiClient } from './client'
import type { User, Notebook, Note, ContextObject, Quiz, QuizRun, QuizRecord } from '../types'

export interface MeResponse {
  user: User
  notebooks: Notebook[]
  notes: Note[]
  context_objects: ContextObject[]
  quizzes: Quiz[]
  quiz_runs: QuizRun[]
  quiz_records: QuizRecord[]
}

export interface GenerateResponse {
  synced: { notebooks: unknown[]; notes: unknown[] }
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
  getMe: () => apiClient.get<MeResponse>('/me'),

  generate: () => apiClient.post<GenerateResponse>('/quizzes'),

  submitQuizRun: (body: {
    started_at: string
    completed_at: string | null
    records: { quiz_id: string; user_answer: string; is_correct: boolean }[]
  }) => apiClient.post<QuizRunResponse>('/quiz-runs', body),
}
