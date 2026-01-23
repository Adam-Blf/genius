import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'xp' | 'streak' | 'hearts' | 'league' | 'default'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  animated?: boolean
  className?: string
}

const variantStyles = {
  xp: 'bg-accent-500/20 text-accent-400 border-accent-500/30',
  streak: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  hearts: 'bg-red-500/20 text-red-400 border-red-500/30',
  league: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
  default: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base'
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  animated = false,
  className
}: BadgeProps) {
  const baseClassName = cn(
    'inline-flex items-center gap-1.5 font-bold rounded-full border',
    variantStyles[variant],
    sizeStyles[size],
    className
  )

  if (animated) {
    return (
      <motion.span
        className={baseClassName}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
      >
        {icon}
        {children}
      </motion.span>
    )
  }

  return (
    <span className={baseClassName}>
      {icon}
      {children}
    </span>
  )
}
