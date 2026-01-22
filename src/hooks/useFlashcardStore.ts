import { useState, useEffect, useCallback } from 'react'
import type {
  FlashcardStore,
  FlashcardSet,
  Flashcard,
  StudySession,
  Badge,
  UserGamificationStats,
  DailyGoal,
  FlashcardStats
} from '../types/flashcards'
import { calculateLevel, calculateSessionXp } from '../types/flashcards'

const STORE_KEY = 'genius_flashcard_store_v2'

// Default badges
const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first-set',
    name: 'Premier Pas',
    description: 'Cree ton premier set de flashcards',
    icon: '🎯',
    category: 'study',
    requirement: 1,
    progress: 0,
    unlockedAt: null,
    rarity: 'common'
  },
  {
    id: 'card-collector',
    name: 'Collectionneur',
    description: 'Cree 50 flashcards',
    icon: '📚',
    category: 'study',
    requirement: 50,
    progress: 0,
    unlockedAt: null,
    rarity: 'common'
  },
  {
    id: 'card-hoarder',
    name: 'Bibliothecaire',
    description: 'Cree 200 flashcards',
    icon: '🏛️',
    category: 'study',
    requirement: 200,
    progress: 0,
    unlockedAt: null,
    rarity: 'rare'
  },
  {
    id: 'streak-3',
    name: 'En Forme',
    description: 'Maintiens une serie de 3 jours',
    icon: '🔥',
    category: 'streak',
    requirement: 3,
    progress: 0,
    unlockedAt: null,
    rarity: 'common'
  },
  {
    id: 'streak-7',
    name: 'Assidu',
    description: 'Maintiens une serie de 7 jours',
    icon: '💪',
    category: 'streak',
    requirement: 7,
    progress: 0,
    unlockedAt: null,
    rarity: 'rare'
  },
  {
    id: 'streak-30',
    name: 'Inarretable',
    description: 'Maintiens une serie de 30 jours',
    icon: '🏆',
    category: 'streak',
    requirement: 30,
    progress: 0,
    unlockedAt: null,
    rarity: 'epic'
  },
  {
    id: 'perfect-5',
    name: 'Sans Faute',
    description: 'Complete 5 sessions parfaites',
    icon: '⭐',
    category: 'mastery',
    requirement: 5,
    progress: 0,
    unlockedAt: null,
    rarity: 'common'
  },
  {
    id: 'perfect-25',
    name: 'Perfectionniste',
    description: 'Complete 25 sessions parfaites',
    icon: '💎',
    category: 'mastery',
    requirement: 25,
    progress: 0,
    unlockedAt: null,
    rarity: 'epic'
  },
  {
    id: 'level-10',
    name: 'Apprenti',
    description: 'Atteins le niveau 10',
    icon: '📈',
    category: 'mastery',
    requirement: 10,
    progress: 0,
    unlockedAt: null,
    rarity: 'rare'
  },
  {
    id: 'level-25',
    name: 'Expert',
    description: 'Atteins le niveau 25',
    icon: '👑',
    category: 'mastery',
    requirement: 25,
    progress: 0,
    unlockedAt: null,
    rarity: 'legendary'
  },
  {
    id: 'study-60',
    name: 'Marathon',
    description: 'Etudie pendant 60 minutes en une journee',
    icon: '⏱️',
    category: 'study',
    requirement: 60,
    progress: 0,
    unlockedAt: null,
    rarity: 'rare'
  },
  {
    id: 'review-100',
    name: 'Reviseur',
    description: 'Revise 100 cartes',
    icon: '🔄',
    category: 'study',
    requirement: 100,
    progress: 0,
    unlockedAt: null,
    rarity: 'common'
  },
  {
    id: 'review-1000',
    name: 'Maitre',
    description: 'Revise 1000 cartes',
    icon: '🧠',
    category: 'mastery',
    requirement: 1000,
    progress: 0,
    unlockedAt: null,
    rarity: 'legendary'
  }
]

const DEFAULT_DAILY_GOAL: DailyGoal = {
  cardsToReview: 20,
  cardsReviewed: 0,
  minutesToStudy: 15,
  minutesStudied: 0,
  xpToEarn: 100,
  xpEarned: 0,
  completedAt: null
}

const DEFAULT_GAMIFICATION: UserGamificationStats = {
  totalXp: 0,
  currentLevel: 1,
  xpToNextLevel: 100,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  totalStudyTime: 0,
  totalCardsReviewed: 0,
  perfectSessions: 0,
  badges: DEFAULT_BADGES,
  dailyGoal: DEFAULT_DAILY_GOAL,
  weeklyXp: [0, 0, 0, 0, 0, 0, 0]
}

const DEFAULT_STATS: FlashcardStats = {
  totalSets: 0,
  totalCards: 0,
  totalReviews: 0,
  cardsCreatedToday: 0,
  averageMastery: 0,
  studyTimeToday: 0,
  mostStudiedSet: null
}

const DEFAULT_STORE: FlashcardStore = {
  sets: [],
  sessions: [],
  stats: DEFAULT_STATS,
  gamification: DEFAULT_GAMIFICATION
}

// Migrate old localStorage data
function migrateOldData(): FlashcardSet[] {
  const oldKey = 'genius_flashcard_sets'
  const oldData = localStorage.getItem(oldKey)

  if (oldData) {
    try {
      const sets = JSON.parse(oldData)
      // Clear old data after migration
      localStorage.removeItem(oldKey)

      return sets.map((set: any) => ({
        ...set,
        updatedAt: set.createdAt,
        totalReviews: 0,
        averageScore: 0,
        lastStudiedAt: null,
        tags: [],
        cards: set.cards.map((card: any) => ({
          ...card,
          timesReviewed: 0,
          timesCorrect: 0,
          lastReviewedAt: null,
          masteryLevel: 0
        }))
      }))
    } catch {
      return []
    }
  }

  return []
}

export function useFlashcardStore() {
  const [store, setStore] = useState<FlashcardStore>(DEFAULT_STORE)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const savedStore = localStorage.getItem(STORE_KEY)

    if (savedStore) {
      try {
        const parsed = JSON.parse(savedStore)
        // Ensure all badges exist (add new ones if missing)
        const existingBadgeIds = parsed.gamification?.badges?.map((b: Badge) => b.id) || []
        const missingBadges = DEFAULT_BADGES.filter(b => !existingBadgeIds.includes(b.id))

        setStore({
          ...DEFAULT_STORE,
          ...parsed,
          gamification: {
            ...DEFAULT_GAMIFICATION,
            ...parsed.gamification,
            badges: [...(parsed.gamification?.badges || []), ...missingBadges],
            dailyGoal: {
              ...DEFAULT_DAILY_GOAL,
              ...parsed.gamification?.dailyGoal
            }
          }
        })
      } catch {
        // If parse fails, check for old data to migrate
        const migratedSets = migrateOldData()
        if (migratedSets.length > 0) {
          setStore({
            ...DEFAULT_STORE,
            sets: migratedSets,
            stats: {
              ...DEFAULT_STATS,
              totalSets: migratedSets.length,
              totalCards: migratedSets.reduce((sum, set) => sum + set.cards.length, 0)
            }
          })
        }
      }
    } else {
      // Try to migrate old data
      const migratedSets = migrateOldData()
      if (migratedSets.length > 0) {
        setStore({
          ...DEFAULT_STORE,
          sets: migratedSets,
          stats: {
            ...DEFAULT_STATS,
            totalSets: migratedSets.length,
            totalCards: migratedSets.reduce((sum, set) => sum + set.cards.length, 0)
          }
        })
      }
    }

    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever store changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORE_KEY, JSON.stringify(store))
    }
  }, [store, isLoaded])

  // Check and update streak
  const checkStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    setStore(prev => {
      const lastActivity = prev.gamification.lastActivityDate

      if (!lastActivity) {
        return prev
      }

      // If last activity was not yesterday and not today, reset streak
      if (lastActivity !== yesterday && lastActivity !== today) {
        return {
          ...prev,
          gamification: {
            ...prev.gamification,
            currentStreak: 0
          }
        }
      }

      return prev
    })
  }, [])

  // Check on load
  useEffect(() => {
    if (isLoaded) {
      checkStreak()
    }
  }, [isLoaded, checkStreak])

  // Reset daily goal if new day
  useEffect(() => {
    if (isLoaded) {
      const today = new Date().toISOString().split('T')[0]
      const lastActivity = store.gamification.lastActivityDate

      if (lastActivity && lastActivity !== today) {
        setStore(prev => ({
          ...prev,
          gamification: {
            ...prev.gamification,
            dailyGoal: {
              ...DEFAULT_DAILY_GOAL,
              cardsToReview: prev.gamification.dailyGoal.cardsToReview,
              minutesToStudy: prev.gamification.dailyGoal.minutesToStudy,
              xpToEarn: prev.gamification.dailyGoal.xpToEarn
            }
          },
          stats: {
            ...prev.stats,
            cardsCreatedToday: 0,
            studyTimeToday: 0
          }
        }))
      }
    }
  }, [isLoaded, store.gamification.lastActivityDate])

  // Add a new flashcard set
  const addSet = useCallback((set: Omit<FlashcardSet, 'id' | 'createdAt' | 'updatedAt' | 'totalReviews' | 'averageScore' | 'lastStudiedAt' | 'tags'>) => {
    const newSet: FlashcardSet = {
      ...set,
      id: `set-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalReviews: 0,
      averageScore: 0,
      lastStudiedAt: null,
      tags: [],
      cards: set.cards.map((card, index) => ({
        ...card,
        id: `card-${Date.now()}-${index}`,
        timesReviewed: 0,
        timesCorrect: 0,
        lastReviewedAt: null,
        masteryLevel: 0
      }))
    }

    setStore(prev => {
      const newStore = {
        ...prev,
        sets: [newSet, ...prev.sets],
        stats: {
          ...prev.stats,
          totalSets: prev.stats.totalSets + 1,
          totalCards: prev.stats.totalCards + newSet.cards.length,
          cardsCreatedToday: prev.stats.cardsCreatedToday + newSet.cards.length
        }
      }

      // Check for badge unlocks
      return checkBadgeUnlocks(newStore)
    })

    return newSet.id
  }, [])

  // Delete a set
  const deleteSet = useCallback((setId: string) => {
    setStore(prev => {
      const setToDelete = prev.sets.find(s => s.id === setId)
      if (!setToDelete) return prev

      return {
        ...prev,
        sets: prev.sets.filter(s => s.id !== setId),
        stats: {
          ...prev.stats,
          totalSets: prev.stats.totalSets - 1,
          totalCards: prev.stats.totalCards - setToDelete.cards.length
        }
      }
    })
  }, [])

  // Record a study session
  const recordSession = useCallback((session: Omit<StudySession, 'id' | 'xpEarned'>) => {
    const isPerfect = session.cardsIncorrect === 0 && session.cardsStudied > 0
    const xpEarned = calculateSessionXp(
      session.cardsCorrect,
      session.cardsStudied,
      store.gamification.currentStreak > 0,
      isPerfect
    )

    const newSession: StudySession = {
      ...session,
      id: `session-${Date.now()}`,
      xpEarned
    }

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    setStore(prev => {
      const lastActivity = prev.gamification.lastActivityDate
      let newStreak = prev.gamification.currentStreak

      // Update streak
      if (!lastActivity || lastActivity === yesterday) {
        newStreak = prev.gamification.currentStreak + 1
      } else if (lastActivity !== today) {
        newStreak = 1
      }

      const levelInfo = calculateLevel(prev.gamification.totalXp + xpEarned)

      // Update weekly XP
      const dayOfWeek = new Date().getDay()
      const weeklyXp = [...prev.gamification.weeklyXp]
      weeklyXp[dayOfWeek] = (weeklyXp[dayOfWeek] || 0) + xpEarned

      // Update daily goal
      const dailyGoal = {
        ...prev.gamification.dailyGoal,
        cardsReviewed: prev.gamification.dailyGoal.cardsReviewed + session.cardsStudied,
        minutesStudied: prev.gamification.dailyGoal.minutesStudied + Math.floor(session.duration / 60),
        xpEarned: prev.gamification.dailyGoal.xpEarned + xpEarned
      }

      // Check if daily goal completed
      if (
        dailyGoal.cardsReviewed >= dailyGoal.cardsToReview &&
        dailyGoal.minutesStudied >= dailyGoal.minutesToStudy &&
        dailyGoal.xpEarned >= dailyGoal.xpToEarn &&
        !dailyGoal.completedAt
      ) {
        dailyGoal.completedAt = new Date().toISOString()
      }

      // Update set stats
      const updatedSets = prev.sets.map(set => {
        if (set.id === session.setId) {
          return {
            ...set,
            totalReviews: set.totalReviews + 1,
            lastStudiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
        return set
      })

      const newStore: FlashcardStore = {
        ...prev,
        sets: updatedSets,
        sessions: [newSession, ...prev.sessions].slice(0, 100), // Keep last 100 sessions
        stats: {
          ...prev.stats,
          totalReviews: prev.stats.totalReviews + 1,
          studyTimeToday: prev.stats.studyTimeToday + Math.floor(session.duration / 60),
          mostStudiedSet: session.setTitle
        },
        gamification: {
          ...prev.gamification,
          totalXp: prev.gamification.totalXp + xpEarned,
          currentLevel: levelInfo.level,
          xpToNextLevel: levelInfo.xpForNextLevel,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, prev.gamification.longestStreak),
          lastActivityDate: today,
          totalStudyTime: prev.gamification.totalStudyTime + Math.floor(session.duration / 60),
          totalCardsReviewed: prev.gamification.totalCardsReviewed + session.cardsStudied,
          perfectSessions: prev.gamification.perfectSessions + (isPerfect ? 1 : 0),
          dailyGoal,
          weeklyXp
        }
      }

      return checkBadgeUnlocks(newStore)
    })

    return xpEarned
  }, [store.gamification.currentStreak])

  // Check and unlock badges
  const checkBadgeUnlocks = (state: FlashcardStore): FlashcardStore => {
    const { gamification, stats } = state
    const now = new Date().toISOString()

    const updatedBadges = gamification.badges.map(badge => {
      if (badge.unlockedAt) return badge

      let progress = badge.progress

      switch (badge.id) {
        case 'first-set':
          progress = stats.totalSets
          break
        case 'card-collector':
        case 'card-hoarder':
          progress = stats.totalCards
          break
        case 'streak-3':
        case 'streak-7':
        case 'streak-30':
          progress = gamification.currentStreak
          break
        case 'perfect-5':
        case 'perfect-25':
          progress = gamification.perfectSessions
          break
        case 'level-10':
        case 'level-25':
          progress = gamification.currentLevel
          break
        case 'study-60':
          progress = stats.studyTimeToday
          break
        case 'review-100':
        case 'review-1000':
          progress = gamification.totalCardsReviewed
          break
      }

      const unlocked = progress >= badge.requirement

      return {
        ...badge,
        progress,
        unlockedAt: unlocked && !badge.unlockedAt ? now : badge.unlockedAt
      }
    })

    return {
      ...state,
      gamification: {
        ...gamification,
        badges: updatedBadges
      }
    }
  }

  // Get set by ID
  const getSet = useCallback((setId: string): FlashcardSet | undefined => {
    return store.sets.find(s => s.id === setId)
  }, [store.sets])

  // Update card mastery after review
  const updateCardMastery = useCallback((setId: string, cardId: string, correct: boolean) => {
    setStore(prev => ({
      ...prev,
      sets: prev.sets.map(set => {
        if (set.id !== setId) return set

        return {
          ...set,
          cards: set.cards.map(card => {
            if (card.id !== cardId) return card

            const newTimesReviewed = card.timesReviewed + 1
            const newTimesCorrect = card.timesCorrect + (correct ? 1 : 0)
            const accuracy = newTimesCorrect / newTimesReviewed
            const newMastery = Math.min(100, Math.floor(accuracy * 100 * Math.log10(newTimesReviewed + 1)))

            return {
              ...card,
              timesReviewed: newTimesReviewed,
              timesCorrect: newTimesCorrect,
              lastReviewedAt: new Date().toISOString(),
              masteryLevel: newMastery
            }
          })
        }
      })
    }))
  }, [])

  // Get recent sessions
  const getRecentSessions = useCallback((limit: number = 10): StudySession[] => {
    return store.sessions.slice(0, limit)
  }, [store.sessions])

  // Get unlocked badges
  const getUnlockedBadges = useCallback((): Badge[] => {
    return store.gamification.badges.filter(b => b.unlockedAt !== null)
  }, [store.gamification.badges])

  // Get progress towards next badge
  const getNextBadges = useCallback((limit: number = 3): Badge[] => {
    return store.gamification.badges
      .filter(b => !b.unlockedAt)
      .sort((a, b) => (b.progress / b.requirement) - (a.progress / a.requirement))
      .slice(0, limit)
  }, [store.gamification.badges])

  return {
    store,
    isLoaded,
    // Set operations
    addSet,
    deleteSet,
    getSet,
    // Session operations
    recordSession,
    getRecentSessions,
    // Card operations
    updateCardMastery,
    // Badge operations
    getUnlockedBadges,
    getNextBadges,
    // Stats
    stats: store.stats,
    gamification: store.gamification,
    sets: store.sets,
    sessions: store.sessions
  }
}

export type FlashcardStoreReturn = ReturnType<typeof useFlashcardStore>
