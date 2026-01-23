import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '../../lib/utils'

type AnswerState = 'default' | 'selected' | 'correct' | 'wrong'

interface AnswerButtonProps {
  answer: string
  index: number
  state: AnswerState
  disabled?: boolean
  onClick: () => void
}

const stateStyles: Record<AnswerState, string> = {
  default: 'bg-genius-card border-genius-border hover:bg-white/10 hover:border-white/30',
  selected: 'bg-primary-500/20 border-primary-500',
  correct: 'bg-green-500/20 border-green-500 text-green-400',
  wrong: 'bg-red-500/20 border-red-500 text-red-400'
}

const letters = ['A', 'B', 'C', 'D']

export function AnswerButton({
  answer,
  index,
  state,
  disabled,
  onClick
}: AnswerButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left p-4 rounded-2xl border-2 transition-colors',
        'flex items-center gap-3',
        'disabled:cursor-not-allowed',
        stateStyles[state]
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      {...(state === 'wrong' && {
        animate: {
          x: [0, -10, 10, -10, 10, 0],
          opacity: 1,
          y: 0
        },
        transition: { duration: 0.5 }
      })}
    >
      {/* Letter badge */}
      <span className={cn(
        'flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm',
        state === 'default' && 'bg-gray-700 text-gray-300',
        state === 'selected' && 'bg-primary-500 text-white',
        state === 'correct' && 'bg-green-500 text-white',
        state === 'wrong' && 'bg-red-500 text-white'
      )}>
        {state === 'correct' ? (
          <Check className="w-5 h-5" />
        ) : state === 'wrong' ? (
          <X className="w-5 h-5" />
        ) : (
          letters[index]
        )}
      </span>

      {/* Answer text */}
      <span className="flex-1 font-medium">{answer}</span>

      {/* Correct/Wrong icon on the right */}
      {state === 'correct' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <Check className="w-6 h-6 text-green-400" />
        </motion.div>
      )}
      {state === 'wrong' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <X className="w-6 h-6 text-red-400" />
        </motion.div>
      )}
    </motion.button>
  )
}
