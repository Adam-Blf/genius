import type { Category } from '@/types'
import { cn } from '@/lib/utils'
import { CategoryIcon } from './Icon'

interface BadgeProps {
  category: Category
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showLabel?: boolean
  className?: string
}

const categoryColors: Record<Category, { bg: string; text: string; border: string }> = {
  science: { bg: 'bg-science/20', text: 'text-science', border: 'border-science/30' },
  art: { bg: 'bg-art/20', text: 'text-art', border: 'border-art/30' },
  history: { bg: 'bg-history/20', text: 'text-history', border: 'border-history/30' },
  geography: { bg: 'bg-geography/20', text: 'text-geography', border: 'border-geography/30' },
  sport: { bg: 'bg-sport/20', text: 'text-sport', border: 'border-sport/30' },
  music: { bg: 'bg-music/20', text: 'text-music', border: 'border-music/30' },
  cinema: { bg: 'bg-cinema/20', text: 'text-cinema', border: 'border-cinema/30' },
  literature: { bg: 'bg-literature/20', text: 'text-literature', border: 'border-literature/30' },
}

const categoryLabels: Record<Category, string> = {
  science: 'Science',
  art: 'Art',
  history: 'Histoire',
  geography: 'Géographie',
  sport: 'Sport',
  music: 'Musique',
  cinema: 'Cinéma',
  literature: 'Littérature',
}

const sizeStyles = {
  sm: { container: 'px-2 py-0.5 text-xs gap-1', icon: 'size-3' },
  md: { container: 'px-2.5 py-1 text-sm gap-1.5', icon: 'size-4' },
  lg: { container: 'px-3 py-1.5 text-base gap-2', icon: 'size-5' },
}

export function Badge({
  category,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className,
}: BadgeProps) {
  const colors = categoryColors[category]
  const styles = sizeStyles[size]

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        colors.bg,
        colors.text,
        colors.border,
        styles.container,
        className
      )}
    >
      {showIcon && <CategoryIcon category={category} className={styles.icon} />}
      {showLabel && <span>{categoryLabels[category]}</span>}
    </span>
  )
}

// Simple variant for difficulty
interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard'
  className?: string
}

const difficultyStyles = {
  easy: { bg: 'bg-success/20', text: 'text-success', label: 'Facile' },
  medium: { bg: 'bg-warning/20', text: 'text-warning', label: 'Moyen' },
  hard: { bg: 'bg-error/20', text: 'text-error', label: 'Difficile' },
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const style = difficultyStyles[difficulty]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
        style.bg,
        style.text,
        className
      )}
    >
      {style.label}
    </span>
  )
}
