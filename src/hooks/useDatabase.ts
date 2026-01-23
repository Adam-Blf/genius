import { useState, useEffect, useCallback } from 'react'
import { db, dbHelpers, type SavedFact, type Flashcard, type UserStats, type Note, type Goal } from '../lib/db'
import { useLiveQuery } from 'dexie-react-hooks'

// Hook for saved facts
export function useSavedFacts() {
  const facts = useLiveQuery(() => db.savedFacts.orderBy('savedAt').reverse().toArray())

  const saveFact = useCallback(async (fact: Omit<SavedFact, 'id' | 'savedAt'>) => {
    return dbHelpers.saveFact(fact)
  }, [])

  const deleteFact = useCallback(async (id: number) => {
    return dbHelpers.deleteFact(id)
  }, [])

  const isFactSaved = useCallback(async (factId: string) => {
    return dbHelpers.isFactSaved(factId)
  }, [])

  return {
    facts: facts ?? [],
    saveFact,
    deleteFact,
    isFactSaved,
    isLoading: facts === undefined
  }
}

// Hook for flashcards with spaced repetition
export function useFlashcards() {
  const allCards = useLiveQuery(() => db.flashcards.toArray())
  const dueCards = useLiveQuery(() => dbHelpers.getFlashcardsDueForReview())

  const addCard = useCallback(async (card: Omit<Flashcard, 'id' | 'createdAt' | 'interval' | 'easeFactor' | 'repetitions'>) => {
    return dbHelpers.addFlashcard(card)
  }, [])

  const reviewCard = useCallback(async (id: number, quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    return dbHelpers.updateFlashcardReview(id, quality)
  }, [])

  const deleteCard = useCallback(async (id: number) => {
    return db.flashcards.delete(id)
  }, [])

  return {
    allCards: allCards ?? [],
    dueCards: dueCards ?? [],
    addCard,
    reviewCard,
    deleteCard,
    isLoading: allCards === undefined
  }
}

// Hook for user stats and gamification
export function useUserStats() {
  const stats = useLiveQuery(() => dbHelpers.getUserStats())

  const addXP = useCallback(async (amount: number) => {
    await dbHelpers.addXP(amount)
    await dbHelpers.updateStreak()
  }, [])

  const incrementCards = useCallback(async () => {
    const currentStats = await dbHelpers.getUserStats()
    if (!currentStats) return

    const today = new Date().toISOString().split('T')[0]
    let dailyProgress = currentStats.dailyProgress

    if (dailyProgress.date !== today) {
      dailyProgress = { cards: 0, xp: 0, date: today }
    }

    dailyProgress.cards += 1

    await db.userStats.update(currentStats.id!, {
      totalCards: currentStats.totalCards + 1,
      dailyProgress
    })
  }, [])

  const incrementQuizzes = useCallback(async (correct: number) => {
    const currentStats = await dbHelpers.getUserStats()
    if (!currentStats) return

    await db.userStats.update(currentStats.id!, {
      totalQuizzes: currentStats.totalQuizzes + 1,
      totalCorrect: currentStats.totalCorrect + correct
    })
  }, [])

  return {
    stats,
    addXP,
    incrementCards,
    incrementQuizzes,
    isLoading: stats === undefined
  }
}

// Hook for notes
export function useNotes() {
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray())

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    return dbHelpers.addNote(note)
  }, [])

  const updateNote = useCallback(async (id: number, updates: Partial<Note>) => {
    return dbHelpers.updateNote(id, updates)
  }, [])

  const deleteNote = useCallback(async (id: number) => {
    return db.notes.delete(id)
  }, [])

  const togglePin = useCallback(async (id: number) => {
    const note = await db.notes.get(id)
    if (!note) return
    return dbHelpers.updateNote(id, { isPinned: !note.isPinned })
  }, [])

  return {
    notes: notes ?? [],
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    isLoading: notes === undefined
  }
}

// Hook for goals
export function useGoals() {
  const goals = useLiveQuery(() => db.goals.orderBy('createdAt').reverse().toArray())

  const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'current'>) => {
    return dbHelpers.addGoal(goal)
  }, [])

  const updateProgress = useCallback(async (id: number, progress: number) => {
    return dbHelpers.updateGoalProgress(id, progress)
  }, [])

  const deleteGoal = useCallback(async (id: number) => {
    return db.goals.delete(id)
  }, [])

  return {
    goals: goals ?? [],
    addGoal,
    updateProgress,
    deleteGoal,
    isLoading: goals === undefined
  }
}

// Hook for settings
export function useSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      const allSettings = await db.settings.toArray()
      const settingsMap: Record<string, any> = {}
      allSettings.forEach(s => {
        settingsMap[s.key] = s.value
      })
      setSettings(settingsMap)
      setIsLoading(false)
    }
    loadSettings()
  }, [])

  const getSetting = useCallback((key: string, defaultValue?: any) => {
    return settings[key] ?? defaultValue
  }, [settings])

  const setSetting = useCallback(async (key: string, value: any) => {
    await dbHelpers.setSetting(key, value)
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  return {
    settings,
    getSetting,
    setSetting,
    isLoading
  }
}

// Hook for quiz scores
export function useQuizScores() {
  const scores = useLiveQuery(() => db.quizScores.orderBy('completedAt').reverse().limit(50).toArray())

  const addScore = useCallback(async (score: {
    category: string
    score: number
    totalQuestions: number
    correctAnswers: number
    xpEarned: number
  }) => {
    return dbHelpers.addQuizScore(score)
  }, [])

  const getCategoryStats = useCallback(async (category: string) => {
    return dbHelpers.getCategoryStats(category)
  }, [])

  return {
    scores: scores ?? [],
    addScore,
    getCategoryStats,
    isLoading: scores === undefined
  }
}

// Hook for data export/import
export function useDataManagement() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const exportData = useCallback(async () => {
    setIsExporting(true)
    try {
      const data = await dbHelpers.exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `genius-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('Export failed:', error)
      return false
    } finally {
      setIsExporting(false)
    }
  }, [])

  const importData = useCallback(async (file: File) => {
    setIsImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Clear existing data
      await dbHelpers.clearAllData()

      // Import each table
      if (data.savedFacts?.length) {
        await db.savedFacts.bulkAdd(data.savedFacts.map((f: any) => ({
          ...f,
          savedAt: new Date(f.savedAt)
        })))
      }

      if (data.flashcards?.length) {
        await db.flashcards.bulkAdd(data.flashcards.map((f: any) => ({
          ...f,
          nextReview: new Date(f.nextReview),
          createdAt: new Date(f.createdAt),
          lastReviewed: f.lastReviewed ? new Date(f.lastReviewed) : undefined
        })))
      }

      if (data.quizScores?.length) {
        await db.quizScores.bulkAdd(data.quizScores.map((s: any) => ({
          ...s,
          completedAt: new Date(s.completedAt)
        })))
      }

      if (data.userStats) {
        await db.userStats.add(data.userStats)
      }

      if (data.notes?.length) {
        await db.notes.bulkAdd(data.notes.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt)
        })))
      }

      if (data.memos?.length) {
        await db.memos.bulkAdd(data.memos.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt)
        })))
      }

      if (data.goals?.length) {
        await db.goals.bulkAdd(data.goals.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          deadline: g.deadline ? new Date(g.deadline) : undefined
        })))
      }

      if (data.settings?.length) {
        await db.settings.bulkAdd(data.settings)
      }

      return true
    } catch (error) {
      console.error('Import failed:', error)
      return false
    } finally {
      setIsImporting(false)
    }
  }, [])

  const clearAllData = useCallback(async () => {
    await dbHelpers.clearAllData()
  }, [])

  return {
    exportData,
    importData,
    clearAllData,
    isExporting,
    isImporting
  }
}
