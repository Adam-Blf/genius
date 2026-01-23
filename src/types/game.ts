export interface Question {
  id: string
  category_id: string
  difficulty: 1 | 2 | 3 | 4 | 5
  question_text: string
  correct_answer: string
  wrong_answers: string[]
  explanation: string
  xp_reward: number
}

export interface ShuffledQuestion extends Question {
  shuffledAnswers: string[]
  correctIndex: number
}

export interface GameState {
  questions: ShuffledQuestion[]
  currentQuestionIndex: number
  lives: number
  xpEarned: number
  streak: number
  correctAnswers: number
  wrongAnswers: number
  isComplete: boolean
  isGameOver: boolean
  startTime: number
  answers: AnswerResult[]
}

export interface AnswerResult {
  questionId: string
  selectedAnswer: string
  isCorrect: boolean
  xpEarned: number
  timeSpent: number
}

export interface LessonResult {
  totalXp: number
  correctAnswers: number
  totalQuestions: number
  accuracy: number
  timeSpent: number
  newStreak: number
  perfectLesson: boolean
}

export interface Category {
  id: string
  name: string
  icon_name: string
  color: string
  order_index: number
}

export interface UserProgress {
  id: string
  user_id: string
  category_id: string
  current_lesson: number
  lessons_completed: number[]
  mastery_level: number
}

export interface League {
  id: string
  name: string
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'master'
  min_xp_weekly: number
  icon_url: string
}

export interface LeagueMember {
  id: string
  league_id: string
  user_id: string
  weekly_xp: number
  joined_at: string
  rank_position: number
  profile?: {
    display_name: string
    avatar_url: string
  }
}

export interface GameContextType {
  gameState: GameState | null
  startLesson: (categoryId: string, lessonNumber: number) => Promise<void>
  submitAnswer: (answerIndex: number) => AnswerResult
  nextQuestion: () => void
  endLesson: () => LessonResult
  resetGame: () => void
}
