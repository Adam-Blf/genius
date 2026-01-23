/**
 * Onboarding Guard Component
 * Redirects to onboarding flow if user hasn't completed it
 */

import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useOnboardingContext } from '../contexts/OnboardingContext'

interface OnboardingGuardProps {
  children: ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { hasSeenOnboarding, isLoaded } = useOnboardingContext()

  // Show nothing while loading to prevent flash
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-genius-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Redirect to onboarding if first launch
  if (!hasSeenOnboarding) {
    return <Navigate to="/welcome" replace />
  }

  // User has completed onboarding, render the protected content
  return <>{children}</>
}
