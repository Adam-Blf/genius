import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/atoms'
import { useEffect, useState, useMemo } from 'react'

interface LevelUpToastProps {
  level: number
  isVisible: boolean
  onClose: () => void
}

// Pre-compute confetti positions to avoid Math.random in render
const confettiColors = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']

export function LevelUpToast({ level, isVisible, onClose }: LevelUpToastProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  // Memoize random values for confetti
  const confettiParticles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: `${50 + (Math.random() - 0.5) * 60}%`,
        yOffset: -100 - Math.random() * 80,
        xOffset: (Math.random() - 0.5) * 150,
        color: confettiColors[i % 5],
      })),
    [isVisible]
  ) // Regenerate when toast becomes visible

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true)
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50])
      }

      const timer = setTimeout(() => {
        onClose()
      }, 3500)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isVisible, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        >
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />

          {/* Toast Card */}
          <motion.div
            className="relative bg-gradient-to-br from-primary/20 via-primary-light/10 to-success/20 border border-primary/30 rounded-3xl p-8 shadow-elevated pointer-events-auto"
            initial={{ rotate: -5 }}
            animate={{ rotate: 0 }}
          >
            {/* Confetti particles */}
            {showConfetti && (
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                {confettiParticles.map((particle, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: particle.color,
                      left: particle.left,
                      top: '50%',
                    }}
                    initial={{ opacity: 1, scale: 0, y: 0 }}
                    animate={{
                      opacity: [1, 1, 0],
                      scale: [0, 1, 0.5],
                      y: [-20, particle.yOffset],
                      x: particle.xOffset,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.05,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Star burst effect */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="w-32 h-32 bg-gradient-radial from-primary/30 to-transparent rounded-full blur-xl" />
            </motion.div>

            {/* Content */}
            <div className="relative text-center space-y-3">
              {/* Icon with pulse */}
              <motion.div
                className="inline-flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-primary to-primary-light shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Icon name="TrendingUp" className="size-10 text-white" />
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm font-medium text-primary uppercase tracking-wide">
                  Félicitations !
                </p>
                <h2 className="text-3xl font-bold text-text-primary mt-1">Niveau {level}</h2>
                <p className="text-sm text-text-secondary mt-2">Continue comme ça ! 🎉</p>
              </motion.div>

              {/* Close hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 2 }}
                className="text-xs text-text-muted pt-2"
              >
                Touche pour fermer
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook to manage level up state
export function useLevelUp() {
  const [levelUpData, setLevelUpData] = useState<{ level: number; isVisible: boolean }>({
    level: 1,
    isVisible: false,
  })

  const triggerLevelUp = (newLevel: number) => {
    setLevelUpData({ level: newLevel, isVisible: true })
  }

  const closeLevelUp = () => {
    setLevelUpData((prev) => ({ ...prev, isVisible: false }))
  }

  return { levelUpData, triggerLevelUp, closeLevelUp }
}
