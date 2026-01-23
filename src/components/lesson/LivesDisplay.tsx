import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'

interface LivesDisplayProps {
  lives: number
  maxLives?: number
  showLabel?: boolean
}

export function LivesDisplay({ lives, maxLives = 5, showLabel = true }: LivesDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm text-gray-400 mr-1">Vies:</span>
      )}

      <div className="flex items-center gap-1">
        {Array.from({ length: maxLives }).map((_, i) => (
          <AnimatePresence key={i} mode="wait">
            {i < lives ? (
              <motion.div
                key="full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{
                  scale: [1, 1.5, 0],
                  rotate: [0, 0, -30],
                  opacity: [1, 1, 0]
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Heart className="w-6 h-6 text-gray-700" />
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Numeric display */}
      <motion.span
        key={lives}
        initial={{ scale: 1.5, color: '#ef4444' }}
        animate={{ scale: 1, color: '#9ca3af' }}
        className="text-sm font-bold ml-1"
      >
        {lives}
      </motion.span>
    </div>
  )
}
