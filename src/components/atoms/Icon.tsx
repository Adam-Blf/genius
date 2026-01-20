import { icons, type LucideProps } from 'lucide-react'
import { cn } from '@/lib/utils'

export type IconName = keyof typeof icons

interface IconProps extends LucideProps {
  name: IconName
  className?: string
}

export function Icon({ name, className, ...props }: IconProps) {
  const LucideIcon = icons[name]

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return <LucideIcon className={cn('size-5', className)} {...props} />
}

// Category-specific icon mapping
export const categoryIcons: Record<string, IconName> = {
  science: 'Flask',
  art: 'Palette',
  history: 'Landmark',
  geography: 'Globe',
  sport: 'Trophy',
  music: 'Music',
  cinema: 'Clapperboard',
  literature: 'BookOpen',
}

export function CategoryIcon({ category, className, ...props }: { category: string } & LucideProps) {
  const iconName = categoryIcons[category] ?? 'HelpCircle'
  return <Icon name={iconName} className={className} {...props} />
}
