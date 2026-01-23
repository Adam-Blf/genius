import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

const colorStyles = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500'
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4'
}

export function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  animated = true,
  className
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-gray-400">{value}</span>
          <span className="text-gray-500">/ {max}</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-gray-800 rounded-full overflow-hidden',
        sizeStyles[size]
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full',
            colorStyles[color]
          )}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
