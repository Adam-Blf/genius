/**
 * Onboarding Hook
 * Manages first launch detection and onboarding state
 */

import { useState, useEffect, useCallback } from 'react'

const ONBOARDING_KEY = 'genius_has_seen_onboarding'
const ONBOARDING_PROGRESS_KEY = 'genius_onboarding_progress'

export interface OnboardingProgress {
  currentStep: number
  displayName: string
  selectedLevel: string | null
  selectedCategories: string[]
  learningGoals: string[]
  dailyGoalMinutes: number
  completedAt?: string
}

const DEFAULT_PROGRESS: OnboardingProgress = {
  currentStep: 0,
  displayName: '',
  selectedLevel: null,
  selectedCategories: [],
  learningGoals: [],
  dailyGoalMinutes: 15
}

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null)
  const [progress, setProgress] = useState<OnboardingProgress>(DEFAULT_PROGRESS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load onboarding state from localStorage
  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_KEY)
    const savedProgress = localStorage.getItem(ONBOARDING_PROGRESS_KEY)

    setHasSeenOnboarding(hasSeen === 'true')

    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        setProgress({ ...DEFAULT_PROGRESS, ...parsed })
      } catch {
        console.error('Failed to parse onboarding progress')
      }
    }

    setIsLoaded(true)
  }, [])

  // Save progress to localStorage whenever it changes
  const saveProgress = useCallback((updates: Partial<OnboardingProgress>) => {
    setProgress(prev => {
      const newProgress = { ...prev, ...updates }
      localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(newProgress))
      return newProgress
    })
  }, [])

  // Mark onboarding as complete
  const completeOnboarding = useCallback(() => {
    const completedProgress = {
      ...progress,
      completedAt: new Date().toISOString()
    }
    localStorage.setItem(ONBOARDING_KEY, 'true')
    localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(completedProgress))
    setHasSeenOnboarding(true)
    setProgress(completedProgress)
  }, [progress])

  // Reset onboarding (for testing or re-onboarding)
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY)
    localStorage.removeItem(ONBOARDING_PROGRESS_KEY)
    setHasSeenOnboarding(false)
    setProgress(DEFAULT_PROGRESS)
  }, [])

  // Go to next step
  const nextStep = useCallback(() => {
    saveProgress({ currentStep: progress.currentStep + 1 })
  }, [progress.currentStep, saveProgress])

  // Go to previous step
  const previousStep = useCallback(() => {
    if (progress.currentStep > 0) {
      saveProgress({ currentStep: progress.currentStep - 1 })
    }
  }, [progress.currentStep, saveProgress])

  // Go to specific step
  const goToStep = useCallback((step: number) => {
    saveProgress({ currentStep: step })
  }, [saveProgress])

  return {
    // State
    hasSeenOnboarding,
    isLoaded,
    progress,
    isFirstLaunch: isLoaded && !hasSeenOnboarding,

    // Actions
    saveProgress,
    completeOnboarding,
    resetOnboarding,
    nextStep,
    previousStep,
    goToStep
  }
}

export type OnboardingReturn = ReturnType<typeof useOnboarding>
