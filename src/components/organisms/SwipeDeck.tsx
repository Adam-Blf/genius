import { useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SwipeCard, EmptyDeck } from './SwipeCard'
import { questions } from '@/data/questions'
import { useStore, useCurrentDeck, useCurrentIndex, useSelectedCategories, useHapticEnabled, useSoundEnabled } from '@/store'
import { Button, Icon, ProgressBar } from '@/components/atoms'
import type { Category } from '@/types'

interface SwipeDeckProps {
  onSessionComplete?: () => void
  onCardChange?: () => void
  showTimer?: boolean
}

export function SwipeDeck({ onSessionComplete, onCardChange }: SwipeDeckProps) {
  const currentDeck = useCurrentDeck()
  const currentIndex = useCurrentIndex()
  const selectedCategories = useSelectedCategories()
  const hapticEnabled = useHapticEnabled()
  const soundEnabled = useSoundEnabled()

  const setDeck = useStore((s) => s.setDeck)
  const nextCard = useStore((s) => s.nextCard)
  const markAsKnown = useStore((s) => s.markAsKnown)
  const markAsLearned = useStore((s) => s.markAsLearned)
  const addXp = useStore((s) => s.addXp)
  const updateStreak = useStore((s) => s.updateStreak)
  const undoLastSwipe = useStore((s) => s.undoLastSwipe)

  // Get current question
  const currentQuestion = useMemo(() => {
    if (currentIndex >= currentDeck.length) return null
    const questionId = currentDeck[currentIndex]
    return questions.find((q) => q.id === questionId) ?? null
  }, [currentDeck, currentIndex])

  // Get next question for preview
  const nextQuestion = useMemo(() => {
    if (currentIndex + 1 >= currentDeck.length) return null
    const questionId = currentDeck[currentIndex + 1]
    return questions.find((q) => q.id === questionId) ?? null
  }, [currentDeck, currentIndex])

  // Haptic feedback
  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(intensity)
    }
  }, [hapticEnabled])

  // Handle swipe right (Known)
  const handleSwipeRight = useCallback(() => {
    if (!currentQuestion) return

    triggerHaptic(20)
    markAsKnown(currentQuestion.id)
    addXp(10, currentQuestion.category as Category)
    updateStreak()
    nextCard()
    onCardChange?.()

    // Check if session complete
    if (currentIndex + 1 >= currentDeck.length) {
      onSessionComplete?.()
    }
  }, [currentQuestion, currentIndex, currentDeck.length, markAsKnown, addXp, updateStreak, nextCard, triggerHaptic, onSessionComplete, onCardChange])

  // Handle swipe left (Learn)
  const handleSwipeLeft = useCallback(() => {
    if (!currentQuestion) return

    triggerHaptic(30)
    markAsLearned(currentQuestion.id)
    addXp(20, currentQuestion.category as Category) // More XP for learning
    updateStreak()
    nextCard()
    onCardChange?.()

    // Check if session complete
    if (currentIndex + 1 >= currentDeck.length) {
      onSessionComplete?.()
    }
  }, [currentQuestion, currentIndex, currentDeck.length, markAsLearned, addXp, updateStreak, nextCard, triggerHaptic, onSessionComplete, onCardChange])

  // Refresh deck
  const refreshDeck = useCallback(() => {
    const available = questions.filter(
      (q) => selectedCategories.length === 0 || selectedCategories.includes(q.category as Category)
    )
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    setDeck(shuffled.slice(0, 20).map((q) => q.id))
  }, [selectedCategories, setDeck])

  // Handle undo
  const handleUndo = useCallback(() => {
    triggerHaptic(10)
    undoLastSwipe()
  }, [undoLastSwipe, triggerHaptic])

  // Progress
  const progress = currentDeck.length > 0 ? (currentIndex / currentDeck.length) * 100 : 0
  const isComplete = currentIndex >= currentDeck.length

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
          <span>{currentIndex} / {currentDeck.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} size="sm" variant="gradient" />
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {isComplete ? (
            <EmptyDeck onRefresh={refreshDeck} />
          ) : (
            <>
              {/* Next card preview (behind) */}
              {nextQuestion && (
                <SwipeCard
                  key={`next-${nextQuestion.id}`}
                  question={nextQuestion}
                  onSwipeLeft={() => {}}
                  onSwipeRight={() => {}}
                  isTop={false}
                />
              )}

              {/* Current card */}
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="absolute inset-0"
                >
                  <SwipeCard
                    question={currentQuestion}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    isTop={true}
                  />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {!isComplete && (
        <div className="flex items-center justify-center gap-4 px-4 py-4">
          {/* Undo button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={currentIndex === 0}
            className="size-12 rounded-full"
          >
            <Icon name="Undo2" className="size-5" />
          </Button>

          {/* Swipe Left (Learn) */}
          <Button
            variant="secondary"
            size="icon"
            onClick={handleSwipeLeft}
            className="size-16 rounded-full bg-error/20 hover:bg-error/30 border-2 border-error"
          >
            <Icon name="X" className="size-8 text-error" />
          </Button>

          {/* Swipe Right (Know) */}
          <Button
            variant="secondary"
            size="icon"
            onClick={handleSwipeRight}
            className="size-16 rounded-full bg-success/20 hover:bg-success/30 border-2 border-success"
          >
            <Icon name="Check" className="size-8 text-success" />
          </Button>

          {/* Refresh */}
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshDeck}
            className="size-12 rounded-full"
          >
            <Icon name="RefreshCw" className="size-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
