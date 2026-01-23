import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseStyles = 'bg-gray-700'

  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl'
  }

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-gray-600/20 before:to-transparent',
    none: ''
  }

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined)
      }}
    />
  )
}

// Preset skeleton components
export function SkeletonCard() {
  return (
    <div className="p-4 bg-genius-card rounded-2xl border border-genius-border space-y-3">
      <Skeleton variant="rectangular" height={120} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </div>
  )
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          height={16}
        />
      ))}
    </div>
  )
}
