import { icons, type LucideProps } from 'lucide-react'
import { cn } from '@/lib/utils'

export type IconName = keyof typeof icons

interface IconProps extends Omit<LucideProps, 'name'> {
  name: IconName
  className?: string
}

export function Icon({ name, className, ...props }: IconProps) {
  const LucideIcon = icons[name]
  return <LucideIcon className={cn('size-5', className)} {...props} />
}

// Category-specific icon mapping with proper typing
const categoryIconMap = {
  science: 'FlaskConical',
  art: 'Palette',
  history: 'Landmark',
  geography: 'Globe',
  sport: 'Trophy',
  music: 'Music',
  cinema: 'Clapperboard',
  literature: 'BookOpen',
} as const satisfies Record<string, IconName>

type CategoryKey = keyof typeof categoryIconMap

export function CategoryIcon({
  category,
  className,
  ...props
}: { category: string } & Omit<LucideProps, 'name'>) {
  if (category in categoryIconMap) {
    return <Icon name={categoryIconMap[category as CategoryKey]} className={className} {...props} />
  }
  return <Icon name="Circle" className={className} {...props} />
}
