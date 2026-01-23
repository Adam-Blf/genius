import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ProgressBar } from '../ui/ProgressBar'

interface LessonProgressProps {
  current: number
  total: number
  onClose?: () => void
}

export function LessonProgress({ current, total, onClose }: LessonProgressProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>
      )}

      {/* Progress bar */}
      <div className="flex-1">
        <ProgressBar
          value={current}
          max={total}
          color="primary"
          size="md"
          animated
        />
      </div>

      {/* Counter */}
      <motion.span
        key={current}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="text-sm font-medium text-gray-400 min-w-[3rem] text-right"
      >
        {current}/{total}
      </motion.span>
    </div>
  )
}
