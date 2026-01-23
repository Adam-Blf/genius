import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

interface XPGainProps {
  amount: number
  show: boolean
  onComplete?: () => void
}

export function XPGain({ amount, show, onComplete }: XPGainProps) {
  if (amount <= 0) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -30, scale: 1 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          onAnimationComplete={onComplete}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
        >
          <div className="flex items-center gap-2 bg-accent-500/90 text-white px-4 py-2 rounded-full shadow-lg">
            <Zap className="w-5 h-5 fill-white" />
            <span className="text-xl font-bold">+{amount} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Streak bonus display
interface StreakBonusProps {
  streak: number
  show: boolean
}

export function StreakBonus({ streak, show }: StreakBonusProps) {
  if (streak < 2 || !show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50"
      >
        <div className="flex items-center gap-2 bg-orange-500/90 text-white px-4 py-2 rounded-full shadow-lg">
          <span className="text-lg font-bold">
            {streak}x Combo!
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
