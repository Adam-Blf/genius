import type { Category } from './question'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  requirement: {
    type: 'xp' | 'streak' | 'category_level' | 'total_cards'
    value: number
    category?: Category
  }
}

export interface CategoryProgress {
  category: Category
  level: number
  xp: number
  cardsLearned: number
  cardsKnown: number
  accuracy: number
}

export interface UserStats {
  totalXp: number
  globalLevel: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  totalCardsSwipedRight: number // Known
  totalCardsSwipedLeft: number // To learn
  totalCardsReviewed: number
  categoryProgress: Record<Category, CategoryProgress>
}

export interface UserPreferences {
  name: string
  selectedCategories: Category[]
  soundEnabled: boolean
  hapticEnabled: boolean
  onboardingCompleted: boolean
  tutorialShown: boolean
  dailyGoal: number // cards per day
}

export interface UserProfile {
  id: string
  createdAt: string
  preferences: UserPreferences
  stats: UserStats
  badges: Badge[]
  reviewQueue: string[] // Question IDs to review
  learnedCards: string[] // Question IDs marked as learned
  knownCards: string[] // Question IDs marked as known
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  name: '',
  selectedCategories: [],
  soundEnabled: true,
  hapticEnabled: true,
  onboardingCompleted: false,
  tutorialShown: false,
  dailyGoal: 20,
}

export const DEFAULT_CATEGORY_PROGRESS: CategoryProgress = {
  category: 'science',
  level: 1,
  xp: 0,
  cardsLearned: 0,
  cardsKnown: 0,
  accuracy: 0,
}

export const createDefaultUserStats = (): UserStats => ({
  totalXp: 0,
  globalLevel: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  totalCardsSwipedRight: 0,
  totalCardsSwipedLeft: 0,
  totalCardsReviewed: 0,
  categoryProgress: {
    science: { ...DEFAULT_CATEGORY_PROGRESS, category: 'science' },
    art: { ...DEFAULT_CATEGORY_PROGRESS, category: 'art' },
    history: { ...DEFAULT_CATEGORY_PROGRESS, category: 'history' },
    geography: { ...DEFAULT_CATEGORY_PROGRESS, category: 'geography' },
    sport: { ...DEFAULT_CATEGORY_PROGRESS, category: 'sport' },
    music: { ...DEFAULT_CATEGORY_PROGRESS, category: 'music' },
    cinema: { ...DEFAULT_CATEGORY_PROGRESS, category: 'cinema' },
    literature: { ...DEFAULT_CATEGORY_PROGRESS, category: 'literature' },
  },
})

// XP thresholds for each level
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000,
]

export const getLevel = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export const getXpForNextLevel = (currentXp: number): number => {
  const currentLevel = getLevel(currentXp)
  if (currentLevel >= LEVEL_THRESHOLDS.length) return 0
  return LEVEL_THRESHOLDS[currentLevel] - currentXp
}
