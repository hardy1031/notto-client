export type Formality = 'casual' | 'neutral' | 'formal'

export type QuizType = 'choose_context' | 'choose_pronunciation' | 'fill_metadata'

export interface User {
  id: string
  user_name: string
  first_language: string
  target_language: string
  created_at: string
  updated_at: string
}

export interface Notebook {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  notebook_id: string
  s3_key: string
  created_at: string
  updated_at: string
}

export interface NotePiece {
  id: string
  note_id: string
  order: number
  created_at: string
}

export interface ContextObject {
  id: string
  note_piece_id: string
  note_id: string
  expression: string
  base_meaning: string
  actual_nuance: string
  tone: string
  formality: Formality
  is_slang: boolean
  example_dialogue: { speaker: string; text: string }[]
  created_at: string
  updated_at: string
}

export interface Quiz {
  id: string
  context_object_id: string
  type: QuizType
  question_sentence: string
  answer: string
  choice_pool: string[]
  created_at: string
  updated_at: string
}

export interface QuizRun {
  id: string
  user_id: string
  started_at: string
  completed_at: string | null
}

export interface QuizRecord {
  id: string
  quiz_run_id: string
  quiz_id: string
  choices: string[]
  user_answer: string
  is_correct: boolean
  created_at: string
}
