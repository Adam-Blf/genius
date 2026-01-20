import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'gradient'
  showLabel?: boolean
  label?: string
  animated?: boolean
  className?: string
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const variantStyles = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  gradient: 'bg-gradient-to-r from-primary via-primary-light to-success',
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-text-secondary">{label}</span>}
          {showLabel && (
            <span className="text-sm font-medium text-text-primary">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className={cn('w-full bg-surface-elevated rounded-full overflow-hidden', sizeStyles[size])}
      >
        <div
          className={cn(
            'h-full rounded-full',
            variantStyles[variant],
            animated && 'transition-all duration-slow ease-out'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}

// XP Progress variant with level info
interface XpProgressProps {
  currentXp: number
  xpForNextLevel: number
  level: number
  className?: string
}

export function XpProgress({ currentXp, xpForNextLevel, level, className }: XpProgressProps) {
  const levelStart = currentXp - (currentXp % xpForNextLevel || xpForNextLevel)
  const progress = currentXp - levelStart
  const percentage = (progress / xpForNextLevel) * 100

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-text-secondary">Niveau {level}</span>
        <span className="text-xs text-text-muted">
          {progress} / {xpForNextLevel} XP
        </span>
      </div>
      <ProgressBar value={percentage} variant="gradient" size="sm" />
    </div>
  )
}

// Streak progress (circular variant could be added later)
interface StreakProgressProps {
  current: number
  longest: number
  className?: string
}

export function StreakProgress({ current, longest, className }: StreakProgressProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-1">
        <span className="text-2xl">🔥</span>
        <span className="text-xl font-bold text-text-primary">{current}</span>
      </div>
      {longest > 0 && (
        <span className="text-xs text-text-muted">Record: {longest} jours</span>
      )}
    </div>
  )
}
