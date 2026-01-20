import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from './Icon'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: IconName
  iconPosition?: 'left' | 'right'
  loading?: boolean
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark focus:ring-primary/50',
  secondary:
    'bg-surface-elevated text-text-primary hover:bg-surface-overlay active:bg-surface-overlay focus:ring-text-secondary/30',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-elevated hover:text-text-primary active:bg-surface-overlay',
  danger: 'bg-error text-white hover:bg-error/90 active:bg-error/80 focus:ring-error/50',
  success: 'bg-success text-white hover:bg-success/90 active:bg-success/80 focus:ring-success/50',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2.5',
  icon: 'p-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled === true || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium',
          'rounded-xl transition-all duration-fast',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
          // Disabled styles
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Active feedback
          'active:scale-[0.98]',
          // Variant & Size
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Icon name="LoaderCircle" className="animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && <Icon name={icon} className="size-4" />}
            {children}
            {icon && iconPosition === 'right' && <Icon name={icon} className="size-4" />}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
