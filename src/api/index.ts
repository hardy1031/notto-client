import { apiClient } from './client'
import type { User, Notebook, Note, ContextObject, Quiz, QuizRun, QuizRecord } from '../types'

export type ContextObjectWithQuizzes = ContextObject & { quizzes: Quiz[] }

export type QuizRunWithRecords = QuizRun & { records: QuizRecord[] }

export interface GenerateResponse {
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
  getContextObjects: () => apiClient.get<ContextObjectWithQuizzes[]>('/context-objects'),

  getQuizRuns: () => apiClient.get<QuizRunWithRecords[]>('/quiz-runs'),

  generate: (body: { notebooks: Notebook[]; notes: Note[] }) =>
    apiClient.post<GenerateResponse>('/quizzes', body),

  getUser: () => apiClient.get<{ user: User }>('/auth/me'),

  submitQuizRun: (body: {
    started_at: string
    completed_at: string | null
    records: { quiz_id: string; user_answer: string; is_correct: boolean }[]
  }) => apiClient.post<QuizRunResponse>('/quiz-runs', body),
}
