import { HTMLAttributes, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'solid'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const variantStyles = {
  default: 'bg-genius-card border border-genius-border',
  glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
  solid: 'bg-slate-800 border border-slate-700'
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    padding = 'md',
    interactive = false,
    children,
    ...props
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-2xl',
          variantStyles[variant],
          paddingStyles[padding],
          interactive && 'cursor-pointer hover:bg-white/10 transition-colors',
          className
        )}
        whileHover={interactive ? { scale: 1.02 } : undefined}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'
