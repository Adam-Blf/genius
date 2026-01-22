// Flashcard Types for Genius v2.1

export interface Flashcard {
  id: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  timesReviewed: number
  timesCorrect: number
  lastReviewedAt: string | null
  masteryLevel: number // 0-100
}

export interface FlashcardSet {
  id: string
  title: string
  description: string
  cards: Flashcard[]
  createdAt: string
  updatedAt: string
  source: 'notes' | 'ai' | 'import'
  totalReviews: number
  averageScore: number
  lastStudiedAt: string | null
  tags: string[]
}

export interface StudySession {
  id: string
  setId: string
  setTitle: string
  startedAt: string
  completedAt: string | null
  cardsStudied: number
  cardsCorrect: number
  cardsIncorrect: number
  duration: number // in seconds
  xpEarned: number
  streakMaintained: boolean
}

export interface FlashcardStats {
  totalSets: number
  totalCards: number
  totalReviews: number
  cardsCreatedToday: number
  averageMastery: number
  studyTimeToday: number // in minutes
  mostStudiedSet: string | null
}

// Gamification Types
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'study' | 'streak' | 'mastery' | 'social' | 'special'
  requirement: number
  progress: number
  unlockedAt: string | null
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface DailyGoal {
  cardsToReview: number
  cardsReviewed: number
  minutesToStudy: number
  minutesStudied: number
  xpToEarn: number
  xpEarned: number
  completedAt: string | null
}

export interface UserGamificationStats {
  totalXp: number
  currentLevel: number
  xpToNextLevel: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  totalStudyTime: number // in minutes
  totalCardsReviewed: number
  perfectSessions: number
  badges: Badge[]
  dailyGoal: DailyGoal
  weeklyXp: number[]
}

// Store Types
export interface FlashcardStore {
  sets: FlashcardSet[]
  sessions: StudySession[]
  stats: FlashcardStats
  gamification: UserGamificationStats
}

// Level calculation
export function calculateLevel(xp: number): { level: number; xpInLevel: number; xpForNextLevel: number } {
  // XP required per level increases: 100, 200, 350, 550, 800, etc.
  let level = 1
  let totalXpRequired = 0
  let xpForLevel = 100

  while (totalXpRequired + xpForLevel <= xp) {
    totalXpRequired += xpForLevel
    level++
    xpForLevel = Math.floor(xpForLevel * 1.5)
  }

  return {
    level,
    xpInLevel: xp - totalXpRequired,
    xpForNextLevel: xpForLevel
  }
}

// XP calculation for flashcard results
export function calculateSessionXp(
  cardsCorrect: number,
  totalCards: number,
  streakActive: boolean,
  isPerfect: boolean
): number {
  const baseXp = cardsCorrect * 10
  const accuracyBonus = Math.floor((cardsCorrect / totalCards) * 50)
  const streakBonus = streakActive ? Math.floor(baseXp * 0.2) : 0
  const perfectBonus = isPerfect ? 100 : 0

  return baseXp + accuracyBonus + streakBonus + perfectBonus
}
