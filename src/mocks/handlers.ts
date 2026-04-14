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

  http.post('/quizzes', () => {
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
              choices: ['대박', '헐', '완전', '진짜', '어이없다', '미쳤다', '대단해', '놀라워', '믿기지않아', '말도안돼'],
              created_at: '2026-04-06T12:00:00Z',
              updated_at: '2026-04-06T12:00:00Z',
            },
          ],
        },
      ],
    })
  }),

]
