import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState, useCallback } from 'react'

interface FlipCard3DProps {
  question: string
  answer: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  onAnswer?: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void
  showRating?: boolean
}

const difficultyColors = {
  easy: 'from-green-500 to-emerald-600',
  medium: 'from-amber-500 to-orange-600',
  hard: 'from-red-500 to-rose-600'
}

const difficultyLabels = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile'
}

export function FlipCard3D({
  question,
  answer,
  category,
  difficulty = 'medium',
  onAnswer,
  showRating = true
}: FlipCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)

  // Mouse tracking for 3D tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useTransform(mouseY, [-150, 150], [10, -10])
  const rotateY = useTransform(mouseX, [-150, 150], [-10, 10])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (hasAnswered) return
      const rect = e.currentTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set(e.clientX - centerX)
      mouseY.set(e.clientY - centerY)
    },
    [mouseX, mouseY, hasAnswered]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  const handleFlip = useCallback(() => {
    if (!hasAnswered) {
      setIsFlipped((prev) => !prev)
    }
  }, [hasAnswered])

  const handleRating = useCallback(
    (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
      setHasAnswered(true)
      if (onAnswer) {
        onAnswer(quality)
      }
    },
    [onAnswer]
  )

  const ratingButtons = [
    { quality: 0 as const, label: 'Oublie', color: 'bg-red-600 hover:bg-red-500', emoji: '😵' },
    { quality: 1 as const, label: 'Difficile', color: 'bg-orange-600 hover:bg-orange-500', emoji: '😓' },
    { quality: 3 as const, label: 'Correct', color: 'bg-amber-600 hover:bg-amber-500', emoji: '🤔' },
    { quality: 4 as const, label: 'Bien', color: 'bg-green-600 hover:bg-green-500', emoji: '😊' },
    { quality: 5 as const, label: 'Facile', color: 'bg-emerald-600 hover:bg-emerald-500', emoji: '🎯' }
  ]

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="relative aspect-[3/4] w-full cursor-pointer"
        style={{
          perspective: 1500,
          rotateX: isFlipped ? 0 : rotateX,
          rotateY: isFlipped ? 0 : rotateY,
          transformStyle: 'preserve-3d'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleFlip}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <motion.div
          className="absolute w-full h-full"
          style={{
            transformStyle: 'preserve-3d'
          }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
            mass: 1
          }}
        >
          {/* Front face - Question */}
          <div
            className={`absolute w-full h-full rounded-3xl bg-gradient-to-br ${difficultyColors[difficulty]} p-1 shadow-2xl`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="w-full h-full rounded-[22px] bg-slate-900 p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">❓</span>
                  <span className="text-sm font-medium text-slate-400">Question</span>
                </div>
                {category && (
                  <span className="text-xs px-3 py-1 bg-slate-800 rounded-full text-slate-400">
                    {category}
                  </span>
                )}
              </div>

              {/* Difficulty badge */}
              <div className="mb-4">
                <span
                  className={`text-xs px-3 py-1 bg-gradient-to-r ${difficultyColors[difficulty]} rounded-full text-white font-medium`}
                >
                  {difficultyLabels[difficulty]}
                </span>
              </div>

              {/* Question content */}
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl font-semibold text-white text-center leading-relaxed px-4">
                  {question}
                </p>
              </div>

              {/* Hint */}
              <div className="text-center text-sm text-slate-500 mt-4">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Tap pour voir la reponse
                </motion.span>
              </div>

              {/* Decorative corner */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
            </div>
          </div>

          {/* Back face - Answer */}
          <div
            className="absolute w-full h-full rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="w-full h-full rounded-[22px] bg-slate-900 p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💡</span>
                <span className="text-sm font-medium text-slate-400">Reponse</span>
              </div>

              {/* Answer content */}
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl font-semibold text-white text-center leading-relaxed px-4">
                  {answer}
                </p>
              </div>

              {/* Rating buttons */}
              {showRating && !hasAnswered && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 text-center mb-3">
                    Comment c'etait ?
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {ratingButtons.map((btn) => (
                      <motion.button
                        key={btn.quality}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRating(btn.quality)
                        }}
                        className={`${btn.color} px-3 py-2 rounded-xl text-white text-sm font-medium transition-all flex items-center gap-1`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>{btn.emoji}</span>
                        <span className="hidden sm:inline">{btn.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {hasAnswered && (
                <motion.div
                  className="text-center text-green-400 font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Reponse enregistree !
                </motion.div>
              )}

              {/* Hint to flip back */}
              {!hasAnswered && (
                <div className="text-center text-sm text-slate-500 mt-4">
                  Tap pour retourner
                </div>
              )}

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Shadow beneath card */}
      <motion.div
        className="mt-4 mx-auto w-3/4 h-4 bg-black/30 rounded-full blur-xl"
        animate={{
          scale: isFlipped ? [1, 1.1, 1] : 1,
          opacity: isFlipped ? 0.4 : 0.3
        }}
      />
    </div>
  )
}
