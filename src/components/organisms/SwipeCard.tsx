import { useState } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import type { Question } from '@/types'
import { Badge, DifficultyBadge, Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'

interface SwipeCardProps {
  question: Question
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean
}

export function SwipeCard({ question, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [exitX, setExitX] = useState<number | null>(null)

  // Motion values for drag
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  // Overlay colors based on direction
  const leftOverlayOpacity = useTransform(x, [-100, 0], [1, 0])
  const rightOverlayOpacity = useTransform(x, [0, 100], [0, 1])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 100
    const velocity = info.velocity.x

    if (info.offset.x > threshold || velocity > 500) {
      setExitX(300)
      onSwipeRight()
    } else if (info.offset.x < -threshold || velocity < -500) {
      setExitX(-300)
      onSwipeLeft()
    }
  }

  const handleTap = () => {
    setIsFlipped(!isFlipped)
    // Haptic feedback
    navigator.vibrate?.(10)
  }

  if (!isTop) {
    return (
      <div className="absolute inset-4 bg-surface rounded-3xl shadow-card scale-95 opacity-70" />
    )
  }

  return (
    <>
      {/* Swipe indicators */}
      <motion.div
        className="absolute inset-4 rounded-3xl border-4 border-error bg-error/10 flex items-center justify-center pointer-events-none z-10"
        style={{ opacity: leftOverlayOpacity }}
      >
        <div className="flex flex-col items-center gap-2 text-error">
          <Icon name="BookOpen" className="size-12" />
          <span className="text-xl font-bold">À APPRENDRE</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-4 rounded-3xl border-4 border-success bg-success/10 flex items-center justify-center pointer-events-none z-10"
        style={{ opacity: rightOverlayOpacity }}
      >
        <div className="flex flex-col items-center gap-2 text-success">
          <Icon name="CircleCheck" className="size-12" />
          <span className="text-xl font-bold">JE CONNAIS</span>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        className="absolute inset-4 cursor-grab active:cursor-grabbing perspective-1000"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        animate={exitX !== null ? { x: exitX, opacity: 0 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div
          className={cn(
            'w-full h-full preserve-3d transition-transform duration-500',
            isFlipped && 'rotate-y-180'
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
          onClick={handleTap}
        >
          {/* Front of card */}
          <div
            className="absolute inset-0 bg-surface rounded-3xl shadow-elevated p-6 flex flex-col backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Category & Difficulty */}
            <div className="flex items-center justify-between mb-4">
              <Badge category={question.category} />
              <DifficultyBadge difficulty={question.difficulty} />
            </div>

            {/* Question */}
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xl font-medium text-text-primary text-center leading-relaxed">
                {question.text}
              </p>
            </div>

            {/* Tap hint */}
            <div className="flex items-center justify-center gap-2 text-text-muted text-sm">
              <Icon name="RotateCcw" className="size-4" />
              <span>Touche pour voir la réponse</span>
            </div>
          </div>

          {/* Back of card */}
          <div
            className="absolute inset-0 bg-surface-elevated rounded-3xl shadow-elevated p-6 flex flex-col rotate-y-180 backface-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {/* Category */}
            <div className="flex items-center justify-between mb-4">
              <Badge category={question.category} />
              <span className="text-sm text-text-muted">Réponse</span>
            </div>

            {/* Answer */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <p className="text-2xl font-bold text-primary text-center">{question.answer}</p>

              {question.explanation && (
                <p className="text-sm text-text-secondary text-center">{question.explanation}</p>
              )}

              {question.funFact && (
                <div className="mt-4 p-3 rounded-xl bg-warning/10 border border-warning/20">
                  <p className="text-sm text-warning flex items-start gap-2">
                    <Icon name="Lightbulb" className="size-4 flex-shrink-0 mt-0.5" />
                    <span>{question.funFact}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Swipe hint */}
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="text-error">← À apprendre</span>
              <span className="text-success">Je connais →</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// Empty State component
export function EmptyDeck({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="absolute inset-4 bg-surface rounded-3xl shadow-card flex flex-col items-center justify-center p-6 text-center">
      <div className="size-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
        <Icon name="PartyPopper" className="size-10 text-success" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">Session terminée !</h2>
      <p className="text-text-secondary mb-6">Tu as vu toutes les cartes de cette session.</p>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
      >
        <Icon name="RefreshCw" className="size-5" />
        Nouvelle session
      </button>
    </div>
  )
}
