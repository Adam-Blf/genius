import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Icon } from './Icon'

interface TimerProps {
  duration: number // seconds
  onTimeUp: () => void
  isPaused?: boolean
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Timer({
  duration,
  onTimeUp,
  isPaused = false,
  showProgress = true,
  size = 'md',
  className,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(!isPaused)

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  // Handle pause state
  useEffect(() => {
    setIsRunning(!isPaused)
  }, [isPaused])

  // Countdown logic
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, onTimeUp, timeLeft])

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progress = (timeLeft / duration) * 100

  // Determine urgency color
  const getColor = () => {
    if (progress > 50) return 'text-success'
    if (progress > 25) return 'text-warning'
    return 'text-error'
  }

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Timer display */}
      <motion.div
        className={cn('font-mono font-bold tabular-nums', sizeClasses[size], getColor())}
        animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
      >
        {formatTime(timeLeft)}
      </motion.div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-full h-1 bg-surface-overlay rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full transition-colors',
              progress > 50 ? 'bg-success' : progress > 25 ? 'bg-warning' : 'bg-error'
            )}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Time up overlay */}
      <AnimatePresence>
        {timeLeft === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-error/20 backdrop-blur-sm flex items-center justify-center rounded-3xl"
          >
            <div className="text-center">
              <Icon name="Clock" className="size-12 text-error mx-auto mb-2" />
              <p className="text-xl font-bold text-error">Temps écoulé !</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hook for timer logic
export function useTimer(duration: number, onTimeUp: () => void) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isPaused, setIsPaused] = useState(true)

  const start = useCallback(() => setIsPaused(false), [])
  const pause = useCallback(() => setIsPaused(true), [])
  const reset = useCallback(() => {
    setTimeLeft(duration)
    setIsPaused(true)
  }, [duration])

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPaused, onTimeUp, timeLeft])

  return {
    timeLeft,
    isPaused,
    isRunning: !isPaused && timeLeft > 0,
    start,
    pause,
    reset,
    progress: (timeLeft / duration) * 100,
  }
}
