import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: {
        id: 'mock-user-uuid',
        user_name: 'Hardy',
        email: 'hardy@example.com',
        first_language: 'ja',
        target_language: 'ko',
        created_at: '2026-04-01T12:00:00Z',
      },
    })
  }),

  http.post('/sync', () => {
    return HttpResponse.json({
      notebooks: [
        {
          id: 'notebook-uuid-1',
          user_id: 'mock-user-uuid',
          name: 'スラング',
          created_at: '2026-04-01T12:00:00Z',
          updated_at: '2026-04-01T12:00:00Z',
        },
      ],
      notes: [
        {
          id: 'note-uuid-1',
          notebook_id: 'notebook-uuid-1',
          s3_key: 'mock/notebook-uuid-1/note-uuid-1.md',
          created_at: '2026-04-01T12:00:00Z',
          updated_at: '2026-04-01T12:00:00Z',
        },
        {
          id: 'note-uuid-2',
          notebook_id: 'notebook-uuid-1',
          s3_key: 'mock/notebook-uuid-1/note-uuid-2.md',
          created_at: '2026-04-02T12:00:00Z',
          updated_at: '2026-04-02T12:00:00Z',
        },
      ],
      context_objects: [
        {
          id: 'context-uuid-1',
          note_piece_id: 'note-piece-uuid-1',
          note_id: 'note-uuid-1',
          expression: '겠냐?',
          base_meaning: 'Do you think ~?',
          actual_nuance: "Closer to 'You really think that?' / 'No way'",
          tone: 'rough',
          formality: 'casual',
          is_slang: true,
          example_dialogue: [
            { speaker: 'A', text: '이거 내가 할 수 있겠지?' },
            { speaker: 'B', text: '네가 하겠냐?' },
          ],
          created_at: '2026-04-01T12:00:00Z',
          updated_at: '2026-04-01T12:00:00Z',
        },
        {
          id: 'context-uuid-2',
          note_piece_id: 'note-piece-uuid-2',
          note_id: 'note-uuid-2',
          expression: '어이가 없다',
          base_meaning: 'to be dumbfounded',
          actual_nuance: "I can't believe this — used when something is so absurd you're speechless",
          tone: 'exasperated',
          formality: 'casual',
          is_slang: false,
          example_dialogue: [
            { speaker: 'A', text: '나 시험 공부 안 했는데 만점 받았어' },
            { speaker: 'B', text: '진짜 어이가 없다' },
          ],
          created_at: '2026-04-02T12:00:00Z',
          updated_at: '2026-04-02T12:00:00Z',
        },
      ],
      quizzes: [
        {
          id: 'quiz-uuid-1',
          context_object_id: 'context-uuid-1',
          type: 'choose_context',
          question_sentence: '「マジでそうだと思うん？ありえないだろ」を韓国語のスラングで一言で言うと？',
          answer: '겠냐?',
          created_at: '2026-04-01T12:00:00Z',
          updated_at: '2026-04-01T12:00:00Z',
        },
        {
          id: 'quiz-uuid-2',
          context_object_id: 'context-uuid-1',
          type: 'fill_metadata',
          question_sentence: '겠냐? のformality は？',
          answer: 'casual',
          created_at: '2026-04-01T12:00:00Z',
          updated_at: '2026-04-01T12:00:00Z',
        },
        {
          id: 'quiz-uuid-3',
          context_object_id: 'context-uuid-2',
          type: 'choose_context',
          question_sentence: '어이가 없다 の最も近いニュアンスは？ a) 悲しい b) 呆れて言葉が出ない c) 怒っている d) 恥ずかしい',
          answer: 'b',
          created_at: '2026-04-02T12:00:00Z',
          updated_at: '2026-04-02T12:00:00Z',
        },
      ],
      quiz_runs: [],
      quiz_records: [],
    })
  }),

  http.post('/interpret', () => {
    return HttpResponse.json({
      generated: [
        {
          context_object: {
            id: 'context-uuid-3',
            note_piece_id: 'note-piece-uuid-3',
            note_id: 'note-uuid-3',
            expression: '대박',
            base_meaning: 'jackpot / huge',
            actual_nuance: "Wow / No way / That's insane — used for both good and bad surprises",
            tone: 'excited',
            formality: 'casual',
            is_slang: true,
            example_dialogue: [
              { speaker: 'A', text: '나 오늘 복권 당첨됐어' },
              { speaker: 'B', text: '대박!' },
            ],
            created_at: '2026-04-06T12:00:00Z',
            updated_at: '2026-04-06T12:00:00Z',
          },
          quizzes: [
            {
              id: 'quiz-uuid-4',
              context_object_id: 'context-uuid-3',
              type: 'choose_context',
              question_sentence: '「やばい！信じられない！」を韓国語スラングで？',
              answer: '대박',
              created_at: '2026-04-06T12:00:00Z',
              updated_at: '2026-04-06T12:00:00Z',
            },
          ],
        },
      ],
    })
  }),

  http.post('/quiz-runs', () => {
    return HttpResponse.json({
      quiz_run: {
        id: 'quiz-run-uuid-1',
        started_at: '2026-04-06T12:00:00Z',
        completed_at: '2026-04-06T12:05:00Z',
      },
      quiz_records: [
        {
          id: 'record-uuid-1',
          quiz_run_id: 'quiz-run-uuid-1',
          quiz_id: 'quiz-uuid-1',
          user_answer: '겠냐?',
          is_correct: true,
          created_at: '2026-04-06T12:00:30Z',
        },
      ],
    })
  }),
]
