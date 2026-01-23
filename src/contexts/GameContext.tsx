import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  GameState,
  GameContextType,
  Question,
  ShuffledQuestion,
  AnswerResult,
  LessonResult
} from '../types/game'

const GameContext = createContext<GameContextType | undefined>(undefined)

const QUESTIONS_PER_LESSON = 10
const XP_MULTIPLIERS = {
  1: 1,
  2: 1.2,
  3: 1.5,
  4: 1.8,
  5: 2
}

// Mock profile for no-auth mode
function useLocalProfile() {
  const getProfile = () => {
    const stored = localStorage.getItem('genius_profile')
    return stored ? JSON.parse(stored) : {
      hearts: 5,
      xp_total: 0,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null
    }
  }

  const updateProfile = (updates: Record<string, unknown>) => {
    const current = getProfile()
    const updated = { ...current, ...updates }
    localStorage.setItem('genius_profile', JSON.stringify(updated))
  }

  return { profile: getProfile(), updateProfile }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function shuffleQuestion(question: Question): ShuffledQuestion {
  const allAnswers = [question.correct_answer, ...question.wrong_answers]
  const shuffledAnswers = shuffleArray(allAnswers)
  const correctIndex = shuffledAnswers.indexOf(question.correct_answer)

  return {
    ...question,
    shuffledAnswers,
    correctIndex
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useLocalProfile()
  const [gameState, setGameState] = useState<GameState | null>(null)

  const startLesson = useCallback(async (categoryId: string, lessonNumber: number) => {
    // Fetch questions for this category and lesson
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('difficulty', { ascending: true })
      .limit(QUESTIONS_PER_LESSON)

    if (error) throw error

    if (!questions || questions.length === 0) {
      throw new Error('No questions found for this lesson')
    }

    const shuffledQuestions = questions.map(q => shuffleQuestion(q as Question))

    setGameState({
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      lives: profile?.hearts ?? 5,
      xpEarned: 0,
      streak: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      isComplete: false,
      isGameOver: false,
      startTime: Date.now(),
      answers: []
    })
  }, [profile])

  const submitAnswer = useCallback((answerIndex: number): AnswerResult => {
    if (!gameState) throw new Error('No active game')

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
    const isCorrect = answerIndex === currentQuestion.correctIndex
    const timeSpent = Date.now() - gameState.startTime

    // Calculate XP
    const baseXp = currentQuestion.xp_reward
    const difficultyMultiplier = XP_MULTIPLIERS[currentQuestion.difficulty as keyof typeof XP_MULTIPLIERS] || 1
    const streakBonus = isCorrect ? 1 + (gameState.streak * 0.1) : 1
    const xpEarned = isCorrect ? Math.round(baseXp * difficultyMultiplier * streakBonus) : 0

    const result: AnswerResult = {
      questionId: currentQuestion.id,
      selectedAnswer: currentQuestion.shuffledAnswers[answerIndex],
      isCorrect,
      xpEarned,
      timeSpent
    }

    setGameState(prev => {
      if (!prev) return null

      const newLives = isCorrect ? prev.lives : prev.lives - 1
      const isGameOver = newLives <= 0
      const isLastQuestion = prev.currentQuestionIndex >= prev.questions.length - 1
      const isComplete = isLastQuestion && !isGameOver

      return {
        ...prev,
        lives: newLives,
        xpEarned: prev.xpEarned + xpEarned,
        streak: isCorrect ? prev.streak + 1 : 0,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        wrongAnswers: isCorrect ? prev.wrongAnswers : prev.wrongAnswers + 1,
        isComplete,
        isGameOver,
        answers: [...prev.answers, result]
      }
    })

    // Update hearts in profile if lost a life
    if (!isCorrect && profile) {
      updateProfile({ hearts: Math.max(0, (profile.hearts || 5) - 1) })
    }

    return result
  }, [gameState, profile, updateProfile])

  const nextQuestion = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null

      const nextIndex = prev.currentQuestionIndex + 1
      const isComplete = nextIndex >= prev.questions.length

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        isComplete,
        startTime: Date.now()
      }
    })
  }, [])

  const endLesson = useCallback((): LessonResult => {
    if (!gameState) throw new Error('No active game')

    const totalTime = gameState.answers.reduce((sum, a) => sum + a.timeSpent, 0)
    const accuracy = gameState.questions.length > 0
      ? (gameState.correctAnswers / gameState.questions.length) * 100
      : 0
    const perfectLesson = gameState.correctAnswers === gameState.questions.length

    // Update user profile with earned XP
    if (profile) {
      const newXpTotal = (profile.xp_total || 0) + gameState.xpEarned
      const newStreak = (profile.current_streak || 0) + 1
      const newLongestStreak = Math.max(newStreak, profile.longest_streak || 0)

      updateProfile({
        xp_total: newXpTotal,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: new Date().toISOString().split('T')[0]
      })
    }

    return {
      totalXp: gameState.xpEarned,
      correctAnswers: gameState.correctAnswers,
      totalQuestions: gameState.questions.length,
      accuracy,
      timeSpent: totalTime,
      newStreak: (profile?.current_streak || 0) + 1,
      perfectLesson
    }
  }, [gameState, profile, updateProfile])

  const resetGame = useCallback(() => {
    setGameState(null)
  }, [])

  return (
    <GameContext.Provider value={{
      gameState,
      startLesson,
      submitAnswer,
      nextQuestion,
      endLesson,
      resetGame
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
