import { useEffect, useCallback, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useStore,
  useOnboardingCompleted,
  useAvailableQuestions,
  useUserName,
  useReviewQueue,
} from '@/store'
import { SwipeDeck, TabBar } from '@/components/organisms'
import {
  useToast,
  ModeSelector,
  DifficultyFilter,
  type GameMode,
  type DifficultyFilterType,
} from '@/components/molecules'
import { Timer } from '@/components/atoms'
import { questions } from '@/data/questions'

// Hardcore mode timer duration (seconds)
const HARDCORE_TIME = 10

export function Swipe() {
  const navigate = useNavigate()
  const toast = useToast()
  const onboardingCompleted = useOnboardingCompleted()
  const availableQuestions = useAvailableQuestions()
  const userName = useUserName()
  const reviewQueue = useReviewQueue()
  const setDeck = useStore((s) => s.setDeck)

  // Game mode state
  const [gameMode, setGameMode] = useState<GameMode>('normal')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilterType>('all')
  const [hardcoreTimer, setHardcoreTimer] = useState(HARDCORE_TIME)
  const [isHardcorePaused, setIsHardcorePaused] = useState(true)

  // Redirect if not onboarded
  useEffect(() => {
    if (!onboardingCompleted) {
      void navigate('/welcome', { replace: true })
    }
  }, [onboardingCompleted, navigate])

  // Filter questions by difficulty
  const filteredQuestions = useMemo(() => {
    if (difficultyFilter === 'all') return availableQuestions
    return availableQuestions.filter((q) => q.difficulty === difficultyFilter)
  }, [availableQuestions, difficultyFilter])

  // Get questions based on mode
  const getQuestionsForMode = useCallback(() => {
    switch (gameMode) {
      case 'review':
        return questions.filter((q) => reviewQueue.includes(q.id))
      case 'hardcore':
      case 'normal':
      default:
        return filteredQuestions
    }
  }, [gameMode, filteredQuestions, reviewQueue])

  // Set up deck when mode or filter changes
  useEffect(() => {
    const questionsForMode = getQuestionsForMode()
    if (questionsForMode.length > 0) {
      const shuffled = [...questionsForMode].sort(() => Math.random() - 0.5)
      setDeck(shuffled.slice(0, 20).map((q) => q.id))
    } else {
      setDeck([])
    }
  }, [getQuestionsForMode, setDeck])

  // Handle hardcore timer state based on game mode
  useEffect(() => {
    if (gameMode === 'hardcore') {
      setHardcoreTimer(HARDCORE_TIME)
      setIsHardcorePaused(false)
    } else {
      setIsHardcorePaused(true)
    }
  }, [gameMode])

  // Handle mode change
  const handleModeChange = useCallback(
    (mode: GameMode) => {
      setGameMode(mode)
      if (mode === 'review' && reviewQueue.length === 0) {
        toast.info('Pas de cartes à réviser pour le moment')
        return
      }
      if (mode === 'hardcore') {
        toast.warning('Mode Hardcore : réponds vite !')
      }
    },
    [reviewQueue.length, toast]
  )

  // Handle hardcore time up
  const handleHardcoreTimeUp = useCallback(() => {
    toast.error('Temps écoulé ! Carte passée.')
    // Auto-swipe left (mark as to learn)
    const nextCard = useStore.getState().nextCard
    nextCard()
    setHardcoreTimer(HARDCORE_TIME)
  }, [toast])

  // Reset hardcore timer on card change
  const handleCardChange = useCallback(() => {
    if (gameMode === 'hardcore') {
      setHardcoreTimer(HARDCORE_TIME)
    }
  }, [gameMode])

  // Session complete handler
  const handleSessionComplete = useCallback(() => {
    if (gameMode === 'hardcore') {
      toast.success('Mode Hardcore terminé ! 🔥')
    } else if (gameMode === 'review') {
      toast.success('Révision terminée ! 📚')
    } else {
      toast.success('Session terminée ! Bravo 🎉')
    }
    setIsHardcorePaused(true)
  }, [gameMode, toast])

  // Calculate stats for display
  const questionsCount = getQuestionsForMode().length

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 pt-safe-top">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            {userName ? `Salut ${userName} 👋` : 'Swipy'}
          </h1>
          <p className="text-sm text-text-muted">{questionsCount} questions disponibles</p>
        </div>

        {/* Hardcore Timer */}
        {gameMode === 'hardcore' && !isHardcorePaused && (
          <Timer
            duration={hardcoreTimer}
            onTimeUp={handleHardcoreTimeUp}
            isPaused={isHardcorePaused}
            size="sm"
          />
        )}
      </header>

      {/* Mode & Filter Selection */}
      <div className="px-4 space-y-2 mb-2">
        <ModeSelector
          currentMode={gameMode}
          onModeChange={handleModeChange}
          reviewCount={reviewQueue.length}
        />

        {gameMode !== 'review' && (
          <DifficultyFilter current={difficultyFilter} onChange={setDifficultyFilter} />
        )}
      </div>

      {/* Swipe Area */}
      <main className="flex-1 px-2">
        <SwipeDeck
          onSessionComplete={handleSessionComplete}
          onCardChange={handleCardChange}
          showTimer={gameMode === 'hardcore'}
        />
      </main>

      {/* Tab Bar */}
      <TabBar />
    </div>
  )
}
