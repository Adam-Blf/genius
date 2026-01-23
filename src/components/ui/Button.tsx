import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-lg shadow-primary-600/25',
  secondary: 'bg-secondary-600 hover:bg-secondary-700 active:bg-secondary-800 text-white',
  ghost: 'bg-transparent hover:bg-white/10 active:bg-white/20 text-white border border-white/20',
  danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
  success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white'
}

const sizes: Record<ButtonSize, string> = {
  sm: 'py-2 px-4 text-sm rounded-lg',
  md: 'py-3 px-6 text-base rounded-xl',
  lg: 'py-4 px-8 text-lg rounded-xl'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          'font-semibold transition-all duration-200 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2',
          variants[variant],
          sizes[size],
          className
        )}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
