import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outline' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  onClick?: () => void
}

const variantStyles = {
  default: 'bg-surface',
  elevated: 'bg-surface-elevated shadow-card',
  outline: 'bg-transparent border border-surface-overlay',
  glass: 'bg-surface/80 backdrop-blur-md border border-white/10',
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const roundedStyles = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  rounded = 'xl',
  className,
  onClick,
}: CardProps) {
  const isClickable = !!onClick

  return (
    <div
      className={cn(
        variantStyles[variant],
        paddingStyles[padding],
        roundedStyles[rounded],
        isClickable && 'cursor-pointer transition-transform duration-fast hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {children}
    </div>
  )
}

// Card Header component
interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <h3 className="font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// Card Content wrapper
interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('mt-4', className)}>{children}</div>
}

// Card Footer for actions
interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('flex items-center gap-2 mt-4 pt-4 border-t border-surface-overlay', className)}>
      {children}
    </div>
  )
}
