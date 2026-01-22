import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Fact } from '../data/facts'

interface Flashcard {
  id: string
  question: string
  answer: string
  category: string
  createdAt: Date
  mastered: boolean
}

interface RevisionNote {
  id: string
  title: string
  content: string
  createdAt: Date
  flashcardsGenerated: boolean
}

interface AppState {
  // Fun facts
  savedFacts: Fact[]
  seenFactIds: Set<number>

  // Custom flashcards
  flashcards: Flashcard[]
  revisionNotes: RevisionNote[]

  // Stats
  stats: {
    totalFactsSeen: number
    totalFactsSaved: number
    totalFlashcards: number
    totalMastered: number
    streak: number
    lastActiveDate: string
  }
}

interface AppContextType extends AppState {
  saveFact: (fact: Fact) => void
  removeSavedFact: (id: number) => void
  markFactSeen: (id: number) => void
  addRevisionNote: (note: Omit<RevisionNote, 'id' | 'createdAt' | 'flashcardsGenerated'>) => RevisionNote
  deleteRevisionNote: (id: string) => void
  addFlashcards: (cards: Omit<Flashcard, 'id' | 'createdAt' | 'mastered'>[]) => void
  toggleFlashcardMastered: (id: string) => void
  deleteFlashcard: (id: string) => void
  markNoteFlashcardsGenerated: (noteId: string) => void
  resetProgress: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEY = 'genius_app_state'

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...parsed,
        seenFactIds: new Set(parsed.seenFactIds || []),
        flashcards: parsed.flashcards || [],
        revisionNotes: parsed.revisionNotes || []
      }
    }
    return {
      savedFacts: [],
      seenFactIds: new Set(),
      flashcards: [],
      revisionNotes: [],
      stats: {
        totalFactsSeen: 0,
        totalFactsSaved: 0,
        totalFlashcards: 0,
        totalMastered: 0,
        streak: 0,
        lastActiveDate: new Date().toDateString()
      }
    }
  })

  // Save to localStorage
  useEffect(() => {
    const toSave = {
      ...state,
      seenFactIds: [...state.seenFactIds]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }, [state])

  // Update streak
  useEffect(() => {
    const today = new Date().toDateString()
    if (state.stats.lastActiveDate !== today) {
      const lastDate = new Date(state.stats.lastActiveDate)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      setState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          streak: diffDays === 1 ? prev.stats.streak + 1 : diffDays === 0 ? prev.stats.streak : 1,
          lastActiveDate: today
        }
      }))
    }
  }, [])

  const saveFact = (fact: Fact) => {
    setState(prev => ({
      ...prev,
      savedFacts: [...prev.savedFacts, fact],
      stats: { ...prev.stats, totalFactsSaved: prev.stats.totalFactsSaved + 1 }
    }))
  }

  const removeSavedFact = (id: number) => {
    setState(prev => ({
      ...prev,
      savedFacts: prev.savedFacts.filter(f => f.id !== id)
    }))
  }

  const markFactSeen = (id: number) => {
    setState(prev => {
      const newSeenIds = new Set(prev.seenFactIds)
      newSeenIds.add(id)
      return {
        ...prev,
        seenFactIds: newSeenIds,
        stats: { ...prev.stats, totalFactsSeen: newSeenIds.size }
      }
    })
  }

  const addRevisionNote = (note: Omit<RevisionNote, 'id' | 'createdAt' | 'flashcardsGenerated'>) => {
    const newNote: RevisionNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      flashcardsGenerated: false
    }
    setState(prev => ({
      ...prev,
      revisionNotes: [...prev.revisionNotes, newNote]
    }))
    return newNote
  }

  const deleteRevisionNote = (id: string) => {
    setState(prev => ({
      ...prev,
      revisionNotes: prev.revisionNotes.filter(n => n.id !== id)
    }))
  }

  const addFlashcards = (cards: Omit<Flashcard, 'id' | 'createdAt' | 'mastered'>[]) => {
    const newCards: Flashcard[] = cards.map(card => ({
      ...card,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      mastered: false
    }))
    setState(prev => ({
      ...prev,
      flashcards: [...prev.flashcards, ...newCards],
      stats: { ...prev.stats, totalFlashcards: prev.stats.totalFlashcards + cards.length }
    }))
  }

  const toggleFlashcardMastered = (id: string) => {
    setState(prev => {
      const updated = prev.flashcards.map(f =>
        f.id === id ? { ...f, mastered: !f.mastered } : f
      )
      const mastered = updated.filter(f => f.mastered).length
      return {
        ...prev,
        flashcards: updated,
        stats: { ...prev.stats, totalMastered: mastered }
      }
    })
  }

  const deleteFlashcard = (id: string) => {
    setState(prev => ({
      ...prev,
      flashcards: prev.flashcards.filter(f => f.id !== id)
    }))
  }

  const markNoteFlashcardsGenerated = (noteId: string) => {
    setState(prev => ({
      ...prev,
      revisionNotes: prev.revisionNotes.map(n =>
        n.id === noteId ? { ...n, flashcardsGenerated: true } : n
      )
    }))
  }

  const resetProgress = () => {
    setState({
      savedFacts: [],
      seenFactIds: new Set(),
      flashcards: [],
      revisionNotes: [],
      stats: {
        totalFactsSeen: 0,
        totalFactsSaved: 0,
        totalFlashcards: 0,
        totalMastered: 0,
        streak: 1,
        lastActiveDate: new Date().toDateString()
      }
    })
  }

  return (
    <AppContext.Provider value={{
      ...state,
      saveFact,
      removeSavedFact,
      markFactSeen,
      addRevisionNote,
      deleteRevisionNote,
      addFlashcards,
      toggleFlashcardMastered,
      deleteFlashcard,
      markNoteFlashcardsGenerated,
      resetProgress
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
