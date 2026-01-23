/**
 * Onboarding Context
 * Provides centralized access to onboarding state
 */

import { createContext, useContext, ReactNode } from 'react'
import { useOnboarding, OnboardingReturn } from '../hooks/useOnboarding'

const OnboardingContext = createContext<OnboardingReturn | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const onboardingState = useOnboarding()

  return (
    <OnboardingContext.Provider value={onboardingState}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider')
  }
  return context
}
