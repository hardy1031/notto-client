import { apiClient } from './client'
import type { User, Notebook, Note, ContextObject, Quiz, QuizRun, QuizRecord } from '../types'

// POST /sync/notebooks
export interface SyncNotebooksRequest {
  notebooks: Pick<Notebook, 'id' | 'name' | 'created_at' | 'updated_at'>[]
  notes: (Pick<Note, 'id' | 'notebook_id' | 'created_at' | 'updated_at'> & { content: string })[]
}

export interface SyncNotebooksResponse {
  notebooks: Notebook[]
  notes: Note[]
}

// POST /sync/quizzes
export interface SyncQuizzesRequest {
  context_object_ids: string[]
  quiz_ids: string[]
}

export interface SyncQuizzesResponse {
  context_objects: ContextObject[]
  quizzes: Quiz[]
}

// POST /sync/quiz-runs
export interface SyncQuizRunsRequest {
  quiz_runs: (Pick<QuizRun, 'id' | 'started_at' | 'completed_at'> & {
    records: Pick<QuizRecord, 'id' | 'quiz_id' | 'choices' | 'user_answer' | 'is_correct' | 'created_at'>[]
  })[]
}

export interface SyncQuizRunsResponse {
  quiz_runs: (QuizRun & { records: QuizRecord[] })[]
}

// POST /learn
export interface LearnRequest {
  context_object_id: string
  question: string
}

export interface LearnResponse {
  explanation: string
  examples: { expression: string; meaning: string; tone: string }[]
  related_expressions: string[]
}

export const api = {
  getUser: () =>
    apiClient.get<{ user: User }>('/auth/me'),

  syncNotebooks: (body: SyncNotebooksRequest) =>
    apiClient.post<SyncNotebooksResponse>('/sync/notebooks', body),

  syncQuizzes: (body: SyncQuizzesRequest) =>
    apiClient.post<SyncQuizzesResponse>('/sync/quizzes', body),

  syncQuizRuns: (body: SyncQuizRunsRequest) =>
    apiClient.post<SyncQuizRunsResponse>('/sync/quiz-runs', body),

  learn: (body: LearnRequest) =>
    apiClient.post<LearnResponse>('/learn', body),
}
