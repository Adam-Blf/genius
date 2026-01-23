import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QuestionCard } from '../components/lesson/QuestionCard'
import { AnswerButton } from '../components/lesson/AnswerButton'
import { LessonProgress } from '../components/lesson/LessonProgress'
import { LivesDisplay } from '../components/lesson/LivesDisplay'
import { XPGain, StreakBonus } from '../components/lesson/XPGain'
import { ExplanationModal } from '../components/lesson/ExplanationModal'
import { LessonComplete } from '../components/lesson/LessonComplete'
import { RalphMascot } from '../components/ralph/RalphMascot'
import { ShuffledQuestion, LessonResult, AnswerResult } from '../types/game'

// Mock questions for demo
const mockQuestions: ShuffledQuestion[] = [
  {
    id: '1',
    category_id: 'history',
    difficulty: 2,
    question_text: 'En quelle année a eu lieu la Révolution française ?',
    correct_answer: '1789',
    wrong_answers: ['1776', '1804', '1815'],
    explanation: 'La Révolution française a débuté en 1789 avec la prise de la Bastille le 14 juillet.',
    xp_reward: 10,
    shuffledAnswers: ['1776', '1789', '1804', '1815'],
    correctIndex: 1
  },
  {
    id: '2',
    category_id: 'history',
    difficulty: 3,
    question_text: 'Qui était le premier empereur romain ?',
    correct_answer: 'Auguste',
    wrong_answers: ['Jules César', 'Néron', 'Caligula'],
    explanation: 'Auguste (né Octave) est devenu le premier empereur romain en 27 av. J.-C., fondant le Principat.',
    xp_reward: 15,
    shuffledAnswers: ['Jules César', 'Auguste', 'Néron', 'Caligula'],
    correctIndex: 1
  },
  {
    id: '3',
    category_id: 'history',
    difficulty: 2,
    question_text: 'Quelle civilisation a construit les pyramides de Gizeh ?',
    correct_answer: 'Les Égyptiens',
    wrong_answers: ['Les Mayas', 'Les Romains', 'Les Grecs'],
    explanation: 'Les pyramides de Gizeh ont été construites par les anciens Égyptiens il y a environ 4 500 ans.',
    xp_reward: 10,
    shuffledAnswers: ['Les Mayas', 'Les Égyptiens', 'Les Romains', 'Les Grecs'],
    correctIndex: 1
  },
  {
    id: '4',
    category_id: 'history',
    difficulty: 3,
    question_text: 'En quelle année Christophe Colomb a-t-il découvert l\'Amérique ?',
    correct_answer: '1492',
    wrong_answers: ['1498', '1500', '1485'],
    explanation: 'Christophe Colomb a atteint les Amériques le 12 octobre 1492, pensant avoir atteint les Indes.',
    xp_reward: 15,
    shuffledAnswers: ['1485', '1492', '1498', '1500'],
    correctIndex: 1
  },
  {
    id: '5',
    category_id: 'history',
    difficulty: 4,
    question_text: 'Quel traité a mis fin à la Première Guerre mondiale ?',
    correct_answer: 'Le traité de Versailles',
    wrong_answers: ['Le traité de Paris', 'Le traité de Vienne', 'Le traité de Berlin'],
    explanation: 'Le traité de Versailles, signé le 28 juin 1919, a officiellement mis fin à la Première Guerre mondiale.',
    xp_reward: 20,
    shuffledAnswers: ['Le traité de Paris', 'Le traité de Versailles', 'Le traité de Vienne', 'Le traité de Berlin'],
    correctIndex: 1
  }
]

type AnswerState = 'default' | 'selected' | 'correct' | 'wrong'

export function LessonPage() {
  const navigate = useNavigate()
  const { categoryId, lessonId } = useParams()

  const [questions] = useState(mockQuestions)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lives, setLives] = useState(5)
  const [xpEarned, setXpEarned] = useState(0)
  const [streak, setStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerStates, setAnswerStates] = useState<AnswerState[]>(['default', 'default', 'default', 'default'])
  const [showExplanation, setShowExplanation] = useState(false)
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null)
  const [showXPGain, setShowXPGain] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [startTime] = useState(Date.now())

  const currentQuestion = questions[currentIndex]

  const handleAnswerSelect = useCallback((index: number) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(index)
    const isCorrect = index === currentQuestion.correctIndex

    // Update answer states
    const newStates: AnswerState[] = answerStates.map((_, i) => {
      if (i === index) return isCorrect ? 'correct' : 'wrong'
      if (i === currentQuestion.correctIndex) return 'correct'
      return 'default'
    })
    setAnswerStates(newStates)

    // Calculate XP
    const baseXp = currentQuestion.xp_reward
    const streakBonus = isCorrect ? 1 + (streak * 0.1) : 1
    const earnedXp = isCorrect ? Math.round(baseXp * streakBonus) : 0

    // Update game state
    if (isCorrect) {
      setXpEarned(prev => prev + earnedXp)
      setStreak(prev => prev + 1)
      setCorrectCount(prev => prev + 1)
      setShowXPGain(true)
    } else {
      setStreak(0)
      setLives(prev => prev - 1)
    }

    setLastResult({
      questionId: currentQuestion.id,
      selectedAnswer: currentQuestion.shuffledAnswers[index],
      isCorrect,
      xpEarned: earnedXp,
      timeSpent: Date.now() - startTime
    })

    // Show explanation after a short delay
    setTimeout(() => {
      setShowExplanation(true)
    }, 800)
  }, [selectedAnswer, currentQuestion, answerStates, streak, startTime])

  const handleContinue = useCallback(() => {
    setShowExplanation(false)
    setShowXPGain(false)

    // Check if game over
    if (lives <= 0) {
      setIsGameOver(true)
      return
    }

    // Check if lesson complete
    if (currentIndex >= questions.length - 1) {
      setIsComplete(true)
      return
    }

    // Next question
    setCurrentIndex(prev => prev + 1)
    setSelectedAnswer(null)
    setAnswerStates(['default', 'default', 'default', 'default'])
    setLastResult(null)
  }, [lives, currentIndex, questions.length])

  const handleClose = () => {
    navigate('/learn')
  }

  // Lesson complete result
  const lessonResult: LessonResult = {
    totalXp: xpEarned,
    correctAnswers: correctCount,
    totalQuestions: questions.length,
    accuracy: (correctCount / questions.length) * 100,
    timeSpent: Date.now() - startTime,
    newStreak: streak,
    perfectLesson: correctCount === questions.length
  }

  // Show completion screen
  if (isComplete || isGameOver) {
    return (
      <LessonComplete
        result={lessonResult}
        onContinue={() => navigate('/learn')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-genius-bg p-4 safe-area-top">
      {/* Progress and lives */}
      <div className="max-w-lg mx-auto">
        <LessonProgress
          current={currentIndex + 1}
          total={questions.length}
          onClose={handleClose}
        />

        <div className="flex items-center justify-between mb-6">
          <LivesDisplay lives={lives} />
          <RalphMascot
            mood={selectedAnswer === null ? 'idle' : lastResult?.isCorrect ? 'happy' : 'sad'}
            size="sm"
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
          />
        </AnimatePresence>

        {/* Answers */}
        <div className="space-y-3">
          {currentQuestion.shuffledAnswers.map((answer, index) => (
            <AnswerButton
              key={`${currentQuestion.id}-${index}`}
              answer={answer}
              index={index}
              state={answerStates[index]}
              disabled={selectedAnswer !== null}
              onClick={() => handleAnswerSelect(index)}
            />
          ))}
        </div>
      </div>

      {/* XP Gain animation */}
      <XPGain
        amount={lastResult?.xpEarned || 0}
        show={showXPGain}
        onComplete={() => setShowXPGain(false)}
      />

      {/* Streak bonus */}
      <StreakBonus streak={streak} show={showXPGain && streak >= 2} />

      {/* Explanation modal */}
      <ExplanationModal
        isOpen={showExplanation}
        isCorrect={lastResult?.isCorrect || false}
        correctAnswer={currentQuestion.correct_answer}
        explanation={currentQuestion.explanation}
        xpEarned={lastResult?.xpEarned || 0}
        onContinue={handleContinue}
      />
    </div>
  )
}
