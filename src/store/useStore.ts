import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Category, UserPreferences, UserStats } from '@/types'
import { createDefaultUserStats, DEFAULT_USER_PREFERENCES } from '@/types'

interface SwipyState {
  // User Preferences
  preferences: UserPreferences

  // User Stats
  stats: UserStats

  // Session State
  currentDeck: string[] // Question IDs
  currentIndex: number
  sessionCardsAnswered: number
  lastSwipedCard: string | null

  // Cards State
  learnedCards: string[]
  knownCards: string[]
  reviewQueue: string[]
}

interface SwipyActions {
  // Preferences Actions
  setUserName: (name: string) => void
  toggleCategory: (category: Category) => void
  setSelectedCategories: (categories: Category[]) => void
  toggleSound: () => void
  toggleHaptic: () => void
  completeOnboarding: () => void
  showTutorial: () => void
  setDailyGoal: (goal: number) => void

  // Deck Actions
  setDeck: (questionIds: string[]) => void
  nextCard: () => void
  previousCard: () => void
  resetDeck: () => void

  // Swipe Actions
  markAsKnown: (questionId: string) => void
  markAsLearned: (questionId: string) => void
  undoLastSwipe: () => void

  // Stats Actions
  addXp: (amount: number, category: Category) => void
  updateStreak: () => void

  // Review Actions
  addToReviewQueue: (questionId: string) => void
  removeFromReviewQueue: (questionId: string) => void

  // Reset
  resetAllData: () => void
}

type SwipyStore = SwipyState & SwipyActions

const initialState: SwipyState = {
  preferences: DEFAULT_USER_PREFERENCES,
  stats: createDefaultUserStats(),
  currentDeck: [],
  currentIndex: 0,
  sessionCardsAnswered: 0,
  lastSwipedCard: null,
  learnedCards: [],
  knownCards: [],
  reviewQueue: [],
}

export const useStore = create<SwipyStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Preferences Actions
      setUserName: (name) =>
        set((state) => ({
          preferences: { ...state.preferences, name },
        })),

      toggleCategory: (category) =>
        set((state) => {
          const current = state.preferences.selectedCategories
          const isSelected = current.includes(category)
          return {
            preferences: {
              ...state.preferences,
              selectedCategories: isSelected
                ? current.filter((c) => c !== category)
                : [...current, category],
            },
          }
        }),

      setSelectedCategories: (categories) =>
        set((state) => ({
          preferences: { ...state.preferences, selectedCategories: categories },
        })),

      toggleSound: () =>
        set((state) => ({
          preferences: { ...state.preferences, soundEnabled: !state.preferences.soundEnabled },
        })),

      toggleHaptic: () =>
        set((state) => ({
          preferences: { ...state.preferences, hapticEnabled: !state.preferences.hapticEnabled },
        })),

      completeOnboarding: () =>
        set((state) => ({
          preferences: { ...state.preferences, onboardingCompleted: true },
        })),

      showTutorial: () =>
        set((state) => ({
          preferences: { ...state.preferences, tutorialShown: true },
        })),

      setDailyGoal: (goal) =>
        set((state) => ({
          preferences: { ...state.preferences, dailyGoal: goal },
        })),

      // Deck Actions
      setDeck: (questionIds) =>
        set({
          currentDeck: questionIds,
          currentIndex: 0,
          sessionCardsAnswered: 0,
        }),

      nextCard: () =>
        set((state) => ({
          currentIndex: Math.min(state.currentIndex + 1, state.currentDeck.length),
        })),

      previousCard: () =>
        set((state) => ({
          currentIndex: Math.max(state.currentIndex - 1, 0),
        })),

      resetDeck: () =>
        set({
          currentIndex: 0,
          sessionCardsAnswered: 0,
        }),

      // Swipe Actions
      markAsKnown: (questionId) =>
        set((state) => {
          const newKnownCards = state.knownCards.includes(questionId)
            ? state.knownCards
            : [...state.knownCards, questionId]

          return {
            knownCards: newKnownCards,
            learnedCards: state.learnedCards.filter((id) => id !== questionId),
            lastSwipedCard: questionId,
            sessionCardsAnswered: state.sessionCardsAnswered + 1,
            stats: {
              ...state.stats,
              totalCardsSwipedRight: state.stats.totalCardsSwipedRight + 1,
            },
          }
        }),

      markAsLearned: (questionId) =>
        set((state) => {
          const newLearnedCards = state.learnedCards.includes(questionId)
            ? state.learnedCards
            : [...state.learnedCards, questionId]

          return {
            learnedCards: newLearnedCards,
            knownCards: state.knownCards.filter((id) => id !== questionId),
            lastSwipedCard: questionId,
            sessionCardsAnswered: state.sessionCardsAnswered + 1,
            reviewQueue: [...new Set([...state.reviewQueue, questionId])],
            stats: {
              ...state.stats,
              totalCardsSwipedLeft: state.stats.totalCardsSwipedLeft + 1,
            },
          }
        }),

      undoLastSwipe: () => {
        const { lastSwipedCard, knownCards, learnedCards, reviewQueue } = get()
        if (!lastSwipedCard) return

        set({
          knownCards: knownCards.filter((id) => id !== lastSwipedCard),
          learnedCards: learnedCards.filter((id) => id !== lastSwipedCard),
          reviewQueue: reviewQueue.filter((id) => id !== lastSwipedCard),
          lastSwipedCard: null,
          currentIndex: Math.max(get().currentIndex - 1, 0),
          sessionCardsAnswered: Math.max(get().sessionCardsAnswered - 1, 0),
        })
      },

      // Stats Actions
      addXp: (amount, category) =>
        set((state) => {
          const categoryProgress = state.stats.categoryProgress[category]
          const newCategoryXp = categoryProgress.xp + amount
          const newTotalXp = state.stats.totalXp + amount

          return {
            stats: {
              ...state.stats,
              totalXp: newTotalXp,
              categoryProgress: {
                ...state.stats.categoryProgress,
                [category]: {
                  ...categoryProgress,
                  xp: newCategoryXp,
                },
              },
            },
          }
        }),

      updateStreak: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0]
          const lastDate = state.stats.lastActivityDate

          let newStreak = state.stats.currentStreak

          if (!lastDate) {
            newStreak = 1
          } else {
            const lastDateObj = new Date(lastDate)
            const todayObj = new Date(today)
            const diffDays = Math.floor(
              (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (diffDays === 1) {
              newStreak = state.stats.currentStreak + 1
            } else if (diffDays > 1) {
              newStreak = 1
            }
          }

          return {
            stats: {
              ...state.stats,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.stats.longestStreak),
              lastActivityDate: today,
            },
          }
        }),

      // Review Actions
      addToReviewQueue: (questionId) =>
        set((state) => ({
          reviewQueue: [...new Set([...state.reviewQueue, questionId])],
        })),

      removeFromReviewQueue: (questionId) =>
        set((state) => ({
          reviewQueue: state.reviewQueue.filter((id) => id !== questionId),
        })),

      // Reset
      resetAllData: () => set(initialState),
    }),
    {
      name: 'swipy-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        stats: state.stats,
        learnedCards: state.learnedCards,
        knownCards: state.knownCards,
        reviewQueue: state.reviewQueue,
      }),
    }
  )
)
