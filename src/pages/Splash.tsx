import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingCompleted } from '@/store'

export function Splash() {
  const navigate = useNavigate()
  const onboardingCompleted = useOnboardingCompleted()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onboardingCompleted) {
        navigate('/swipe', { replace: true })
      } else {
        navigate('/welcome', { replace: true })
      }
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [navigate, onboardingCompleted])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Logo Animation */}
      <div className="relative animate-pulse">
        <div className="text-6xl font-bold text-primary">S</div>
        <div className="absolute -top-2 -right-2 size-4 rounded-full bg-success animate-ping" />
      </div>

      {/* App Name */}
      <h1 className="mt-4 text-3xl font-bold text-text-primary animate-fade-in">Swipy</h1>
      <p className="mt-2 text-text-secondary animate-fade-in">Apprends en swipant</p>

      {/* Loading dots */}
      <div className="mt-8 flex gap-2">
        <div className="size-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
        <div className="size-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
        <div className="size-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}
