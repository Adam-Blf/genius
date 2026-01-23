import Dexie, { type EntityTable } from 'dexie'

// Types for our database entities
export interface SavedFact {
  id?: number
  factId: string
  title: string
  content: string
  emoji: string
  category: string
  savedAt: Date
}

export interface Flashcard {
  id?: number
  question: string
  answer: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  nextReview: Date
  interval: number // days until next review
  easeFactor: number // SM-2 algorithm factor
  repetitions: number
  createdAt: Date
  lastReviewed?: Date
}

export interface QuizScore {
  id?: number
  category: string
  score: number
  totalQuestions: number
  correctAnswers: number
  xpEarned: number
  completedAt: Date
}

export interface UserStats {
  id?: number
  totalXP: number
  level: number
  currentStreak: number
  longestStreak: number
  totalQuizzes: number
  totalCorrect: number
  totalCards: number
  lastActiveDate: string
  dailyGoalCards: number
  dailyGoalXP: number
  dailyProgress: {
    cards: number
    xp: number
    date: string
  }
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
  progress?: number
  requirement: number
}

export interface Note {
  id?: number
  title: string
  content: string
  tags: string[]
  color: string
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Memo {
  id?: number
  content: string
  category: string
  createdAt: Date
}

export interface Goal {
  id?: number
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline?: Date
  completed: boolean
  createdAt: Date
}

export interface AppSettings {
  id?: number
  key: string
  value: string | number | boolean | object
}

// Define the database
class GeniusDB extends Dexie {
  savedFacts!: EntityTable<SavedFact, 'id'>
  flashcards!: EntityTable<Flashcard, 'id'>
  quizScores!: EntityTable<QuizScore, 'id'>
  userStats!: EntityTable<UserStats, 'id'>
  badges!: EntityTable<Badge, 'id'>
  notes!: EntityTable<Note, 'id'>
  memos!: EntityTable<Memo, 'id'>
  goals!: EntityTable<Goal, 'id'>
  settings!: EntityTable<AppSettings, 'id'>

  constructor() {
    super('GeniusDB')

    this.version(1).stores({
      savedFacts: '++id, factId, category, savedAt',
      flashcards: '++id, category, difficulty, nextReview, createdAt',
      quizScores: '++id, category, completedAt',
      userStats: '++id',
      badges: 'id, rarity, unlockedAt',
      notes: '++id, *tags, isPinned, createdAt, updatedAt',
      memos: '++id, category, createdAt',
      goals: '++id, completed, deadline, createdAt',
      settings: '++id, key'
    })
  }
}

// Create singleton instance
export const db = new GeniusDB()

// Helper functions for common operations
export const dbHelpers = {
  // Saved Facts
  async saveFact(fact: Omit<SavedFact, 'id' | 'savedAt'>) {
    return db.savedFacts.add({
      ...fact,
      savedAt: new Date()
    })
  },

  async getSavedFacts() {
    return db.savedFacts.orderBy('savedAt').reverse().toArray()
  },

  async deleteFact(id: number) {
    return db.savedFacts.delete(id)
  },

  async isFactSaved(factId: string) {
    const count = await db.savedFacts.where('factId').equals(factId).count()
    return count > 0
  },

  // Flashcards
  async addFlashcard(card: Omit<Flashcard, 'id' | 'createdAt' | 'interval' | 'easeFactor' | 'repetitions'>) {
    return db.flashcards.add({
      ...card,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      createdAt: new Date()
    })
  },

  async getFlashcardsDueForReview() {
    const now = new Date()
    return db.flashcards.where('nextReview').belowOrEqual(now).toArray()
  },

  async updateFlashcardReview(id: number, quality: 0 | 1 | 2 | 3 | 4 | 5) {
    // SM-2 Spaced Repetition Algorithm
    const card = await db.flashcards.get(id)
    if (!card) return

    let { interval, easeFactor, repetitions } = card

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1
      } else if (repetitions === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * easeFactor)
      }
      repetitions += 1
    } else {
      repetitions = 0
      interval = 1
    }

    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)

    return db.flashcards.update(id, {
      interval,
      easeFactor,
      repetitions,
      nextReview,
      lastReviewed: new Date()
    })
  },

  // Quiz Scores
  async addQuizScore(score: Omit<QuizScore, 'id' | 'completedAt'>) {
    return db.quizScores.add({
      ...score,
      completedAt: new Date()
    })
  },

  async getRecentScores(limit = 10) {
    return db.quizScores.orderBy('completedAt').reverse().limit(limit).toArray()
  },

  async getCategoryStats(category: string) {
    const scores = await db.quizScores.where('category').equals(category).toArray()
    const totalGames = scores.length
    const totalCorrect = scores.reduce((sum, s) => sum + s.correctAnswers, 0)
    const totalQuestions = scores.reduce((sum, s) => sum + s.totalQuestions, 0)
    return {
      totalGames,
      accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
      totalXP: scores.reduce((sum, s) => sum + s.xpEarned, 0)
    }
  },

  // User Stats
  async getUserStats(): Promise<UserStats | undefined> {
    const stats = await db.userStats.toArray()
    return stats[0]
  },

  async initializeUserStats(): Promise<number> {
    const existing = await this.getUserStats()
    if (existing) return existing.id!

    return db.userStats.add({
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalQuizzes: 0,
      totalCorrect: 0,
      totalCards: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      dailyGoalCards: 10,
      dailyGoalXP: 100,
      dailyProgress: {
        cards: 0,
        xp: 0,
        date: new Date().toISOString().split('T')[0]
      }
    })
  },

  async addXP(amount: number) {
    const stats = await this.getUserStats()
    if (!stats) {
      await this.initializeUserStats()
      return this.addXP(amount)
    }

    const newXP = stats.totalXP + amount
    const newLevel = Math.floor(newXP / 1000) + 1

    const today = new Date().toISOString().split('T')[0]
    let dailyProgress = stats.dailyProgress

    if (dailyProgress.date !== today) {
      dailyProgress = { cards: 0, xp: 0, date: today }
    }

    dailyProgress.xp += amount

    return db.userStats.update(stats.id!, {
      totalXP: newXP,
      level: newLevel,
      dailyProgress,
      lastActiveDate: today
    })
  },

  async updateStreak() {
    const stats = await this.getUserStats()
    if (!stats) return

    const today = new Date().toISOString().split('T')[0]
    const lastActive = stats.lastActiveDate

    const todayDate = new Date(today)
    const lastActiveDate = new Date(lastActive)
    const diffDays = Math.floor((todayDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))

    let newStreak = stats.currentStreak

    if (diffDays === 0) {
      // Same day, no change
    } else if (diffDays === 1) {
      newStreak += 1
    } else {
      newStreak = 1
    }

    const longestStreak = Math.max(stats.longestStreak, newStreak)

    return db.userStats.update(stats.id!, {
      currentStreak: newStreak,
      longestStreak,
      lastActiveDate: today
    })
  },

  // Notes
  async addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date()
    return db.notes.add({
      ...note,
      createdAt: now,
      updatedAt: now
    })
  },

  async updateNote(id: number, updates: Partial<Note>) {
    return db.notes.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  },

  async getNotes() {
    return db.notes.orderBy('updatedAt').reverse().toArray()
  },

  async getPinnedNotes() {
    return db.notes.where('isPinned').equals(1).toArray()
  },

  // Memos
  async addMemo(content: string, category: string = 'general') {
    return db.memos.add({
      content,
      category,
      createdAt: new Date()
    })
  },

  async getMemos(category?: string) {
    if (category) {
      return db.memos.where('category').equals(category).reverse().toArray()
    }
    return db.memos.orderBy('createdAt').reverse().toArray()
  },

  // Goals
  async addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'current'>) {
    return db.goals.add({
      ...goal,
      current: 0,
      completed: false,
      createdAt: new Date()
    })
  },

  async updateGoalProgress(id: number, progress: number) {
    const goal = await db.goals.get(id)
    if (!goal) return

    const completed = progress >= goal.target
    return db.goals.update(id, {
      current: progress,
      completed
    })
  },

  // Settings
  async getSetting(key: string) {
    const setting = await db.settings.where('key').equals(key).first()
    return setting?.value
  },

  async setSetting(key: string, value: string | number | boolean | object) {
    const existing = await db.settings.where('key').equals(key).first()
    if (existing) {
      return db.settings.update(existing.id!, { value })
    }
    return db.settings.add({ key, value })
  },

  // Bulk operations
  async exportAllData() {
    const [savedFacts, flashcards, quizScores, userStats, badges, notes, memos, goals, settings] = await Promise.all([
      db.savedFacts.toArray(),
      db.flashcards.toArray(),
      db.quizScores.toArray(),
      db.userStats.toArray(),
      db.badges.toArray(),
      db.notes.toArray(),
      db.memos.toArray(),
      db.goals.toArray(),
      db.settings.toArray()
    ])

    return {
      savedFacts,
      flashcards,
      quizScores,
      userStats: userStats[0],
      badges,
      notes,
      memos,
      goals,
      settings,
      exportedAt: new Date().toISOString()
    }
  },

  async clearAllData() {
    await Promise.all([
      db.savedFacts.clear(),
      db.flashcards.clear(),
      db.quizScores.clear(),
      db.userStats.clear(),
      db.badges.clear(),
      db.notes.clear(),
      db.memos.clear(),
      db.goals.clear(),
      db.settings.clear()
    ])
  }
}

// Initialize stats on first load
db.on('ready', async () => {
  await dbHelpers.initializeUserStats()
})
