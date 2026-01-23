import { motion } from 'framer-motion'
import { Heart, Flame, Zap } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { formatNumber } from '../../lib/utils'

interface TopBarProps {
  showBack?: boolean
  onBack?: () => void
  title?: string
}

export function TopBar({ showBack, onBack, title }: TopBarProps) {
  // Mock profile data - no auth needed
  const hearts = 5
  const streak = 0
  const xp = 0

  return (
    <header className="fixed top-0 left-0 right-0 bg-genius-bg/95 backdrop-blur-xl border-b border-genius-border safe-area-top z-40">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-gradient">Genius</span>
            </div>
          )}

          {title && (
            <span className="text-lg font-semibold text-white">{title}</span>
          )}
        </div>

        {/* Right side - Stats */}
        <div className="flex items-center gap-3">
          {/* Hearts */}
          <Badge variant="hearts" size="sm" icon={<Heart className="w-4 h-4 fill-current" />}>
            <motion.span
              key={hearts}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {hearts}
            </motion.span>
          </Badge>

          {/* Streak */}
          <Badge variant="streak" size="sm" icon={<Flame className="w-4 h-4 fill-current" />}>
            <motion.span
              key={streak}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {streak}
            </motion.span>
          </Badge>

          {/* XP */}
          <Badge variant="xp" size="sm" icon={<Zap className="w-4 h-4 fill-current" />}>
            <motion.span
              key={xp}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {formatNumber(xp)}
            </motion.span>
          </Badge>
        </div>
      </div>
    </header>
  )
}
