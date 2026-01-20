import { motion } from 'framer-motion'
import { Icon, type IconName } from '@/components/atoms'
import { cn } from '@/lib/utils'

export type GameMode = 'normal' | 'review' | 'hardcore'

interface ModeSelectorProps {
  currentMode: GameMode
  onModeChange: (mode: GameMode) => void
  reviewCount?: number
  className?: string
}

interface ModeOption {
  mode: GameMode
  label: string
  icon: IconName
  description: string
  color: string
}

const modes: ModeOption[] = [
  {
    mode: 'normal',
    label: 'Normal',
    icon: 'Layers',
    description: 'Cartes mélangées',
    color: 'bg-primary/20 border-primary/30 text-primary',
  },
  {
    mode: 'review',
    label: 'Révision',
    icon: 'RefreshCcw',
    description: 'Cartes à réviser',
    color: 'bg-warning/20 border-warning/30 text-warning',
  },
  {
    mode: 'hardcore',
    label: 'Hardcore',
    icon: 'Zap',
    description: 'Contre la montre',
    color: 'bg-error/20 border-error/30 text-error',
  },
]

export function ModeSelector({
  currentMode,
  onModeChange,
  reviewCount = 0,
  className,
}: ModeSelectorProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {modes.map((option) => {
        const isActive = currentMode === option.mode
        const isDisabled = option.mode === 'review' && reviewCount === 0

        return (
          <motion.button
            key={option.mode}
            whileTap={{ scale: 0.95 }}
            onClick={() => !isDisabled && onModeChange(option.mode)}
            disabled={isDisabled}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
              isActive ? option.color : 'bg-surface border-surface-overlay',
              isDisabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            <Icon name={option.icon} className={cn('size-5', isActive ? '' : 'text-text-muted')} />
            <span className={cn('text-xs font-medium', isActive ? '' : 'text-text-secondary')}>
              {option.label}
            </span>
            {option.mode === 'review' && reviewCount > 0 && (
              <span className="text-[10px] text-text-muted">
                {reviewCount} carte{reviewCount > 1 ? 's' : ''}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

// Difficulty filter selector
export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

interface DifficultyFilterProps {
  current: DifficultyFilter
  onChange: (filter: DifficultyFilter) => void
  className?: string
}

const difficultyOptions: { value: DifficultyFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'easy', label: 'Facile' },
  { value: 'medium', label: 'Moyen' },
  { value: 'hard', label: 'Difficile' },
]

export function DifficultyFilter({ current, onChange, className }: DifficultyFilterProps) {
  return (
    <div className={cn('flex gap-1 p-1 bg-surface rounded-xl', className)}>
      {difficultyOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => {
            onChange(option.value)
          }}
          className={cn(
            'flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            current === option.value
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
