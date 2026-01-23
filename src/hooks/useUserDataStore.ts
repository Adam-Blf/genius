/**
 * User Data Store Hook
 * Centralized Local-First Data Management
 */

import { useState, useEffect, useCallback } from 'react'
import type {
  UserDataStore,
  UserNote,
  UserMemo,
  CustomDataEntry,
  LearningGoal,
  StudyBookmark,
  UserNoteInput,
  UserMemoInput,
  CustomDataInput,
  LearningGoalInput,
  StudyBookmarkInput
} from '../types/userData'
import {
  DEFAULT_USER_DATA_STORE,
  createNote,
  createMemo,
  createCustomData,
  createGoal,
  createBookmark
} from '../types/userData'

const STORE_KEY = 'genius_user_data_v1'

// Simple encryption for sensitive data (API keys)
function simpleEncrypt(text: string): string {
  return btoa(text.split('').reverse().join(''))
}

function simpleDecrypt(encoded: string): string {
  try {
    return atob(encoded).split('').reverse().join('')
  } catch {
    return ''
  }
}

export function useUserDataStore() {
  const [store, setStore] = useState<UserDataStore>(DEFAULT_USER_DATA_STORE)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const savedStore = localStorage.getItem(STORE_KEY)

    if (savedStore) {
      try {
        const parsed = JSON.parse(savedStore)
        // Merge with defaults to ensure all fields exist
        setStore({
          ...DEFAULT_USER_DATA_STORE,
          ...parsed,
          profile: {
            ...DEFAULT_USER_DATA_STORE.profile,
            ...parsed.profile
          },
          preferences: {
            ...DEFAULT_USER_DATA_STORE.preferences,
            ...parsed.preferences,
            // Decrypt API key if present
            llmApiKey: parsed.preferences?.llmApiKey
              ? simpleDecrypt(parsed.preferences.llmApiKey)
              : undefined
          },
          metadata: {
            ...DEFAULT_USER_DATA_STORE.metadata,
            ...parsed.metadata
          }
        })
      } catch {
        console.error('Failed to parse user data store')
      }
    }

    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever store changes
  useEffect(() => {
    if (isLoaded) {
      const toSave = {
        ...store,
        preferences: {
          ...store.preferences,
          // Encrypt API key before saving
          llmApiKey: store.preferences.llmApiKey
            ? simpleEncrypt(store.preferences.llmApiKey)
            : undefined
        },
        metadata: {
          ...store.metadata,
          updatedAt: new Date().toISOString()
        }
      }
      localStorage.setItem(STORE_KEY, JSON.stringify(toSave))
    }
  }, [store, isLoaded])

  // ============================================
  // PROFILE OPERATIONS
  // ============================================

  const updateProfile = useCallback((updates: Partial<UserDataStore['profile']>) => {
    setStore(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...updates
      }
    }))
  }, [])

  // ============================================
  // NOTES OPERATIONS
  // ============================================

  const addNote = useCallback((input: UserNoteInput): string => {
    const note = createNote(input)
    setStore(prev => ({
      ...prev,
      notes: [note, ...prev.notes]
    }))
    return note.id
  }, [])

  const updateNote = useCallback((id: string, updates: Partial<UserNote>) => {
    setStore(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      )
    }))
  }, [])

  const deleteNote = useCallback((id: string) => {
    setStore(prev => ({
      ...prev,
      notes: prev.notes.filter(note => note.id !== id)
    }))
  }, [])

  const toggleNotePin = useCallback((id: string) => {
    setStore(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
          : note
      )
    }))
  }, [])

  const getNotesByTag = useCallback((tag: string): UserNote[] => {
    return store.notes.filter(note => note.tags.includes(tag))
  }, [store.notes])

  const getAllTags = useCallback((): string[] => {
    const tags = new Set<string>()
    store.notes.forEach(note => note.tags.forEach(tag => tags.add(tag)))
    return Array.from(tags)
  }, [store.notes])

  // ============================================
  // MEMOS OPERATIONS
  // ============================================

  const addMemo = useCallback((input: UserMemoInput): string => {
    const memo = createMemo(input)
    setStore(prev => ({
      ...prev,
      memos: [memo, ...prev.memos]
    }))
    return memo.id
  }, [])

  const updateMemo = useCallback((id: string, updates: Partial<UserMemo>) => {
    setStore(prev => ({
      ...prev,
      memos: prev.memos.map(memo =>
        memo.id === id ? { ...memo, ...updates } : memo
      )
    }))
  }, [])

  const deleteMemo = useCallback((id: string) => {
    setStore(prev => ({
      ...prev,
      memos: prev.memos.filter(memo => memo.id !== id)
    }))
  }, [])

  const toggleMemoComplete = useCallback((id: string) => {
    setStore(prev => ({
      ...prev,
      memos: prev.memos.map(memo =>
        memo.id === id ? { ...memo, isCompleted: !memo.isCompleted } : memo
      )
    }))
  }, [])

  const getActiveMemos = useCallback((): UserMemo[] => {
    return store.memos.filter(memo => !memo.isCompleted)
  }, [store.memos])

  // ============================================
  // CUSTOM DATA OPERATIONS
  // ============================================

  const addCustomData = useCallback((input: CustomDataInput): string => {
    const data = createCustomData(input)
    setStore(prev => ({
      ...prev,
      customData: [data, ...prev.customData]
    }))
    return data.id
  }, [])

  const updateCustomData = useCallback((id: string, updates: Partial<CustomDataEntry>) => {
    setStore(prev => ({
      ...prev,
      customData: prev.customData.map(data =>
        data.id === id
          ? { ...data, ...updates, updatedAt: new Date().toISOString() }
          : data
      )
    }))
  }, [])

  const deleteCustomData = useCallback((id: string) => {
    setStore(prev => ({
      ...prev,
      customData: prev.customData.filter(data => data.id !== id)
    }))
  }, [])

  const getCustomDataByCategory = useCallback((category: string): CustomDataEntry[] => {
    return store.customData.filter(data => data.category === category)
  }, [store.customData])

  const getAllCategories = useCallback((): string[] => {
    const categories = new Set<string>()
    store.customData.forEach(data => {
      if (data.category) categories.add(data.category)
    })
    return Array.from(categories)
  }, [store.customData])

  // ============================================
  // GOALS OPERATIONS
  // ============================================

  const addGoal = useCallback((input: LearningGoalInput): string => {
    const goal = createGoal(input)
    setStore(prev => ({
      ...prev,
      goals: [goal, ...prev.goals]
    }))
    return goal.id
  }, [])

  const updateGoal = useCallback((id: string, updates: Partial<LearningGoal>) => {
    setStore(prev => ({
      ...prev,
      goals: prev.goals.map(goal =>
        goal.id === id
          ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
          : goal
      )
    }))
  }, [])

  const deleteGoal = useCallback((id: string) => {
    setStore(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal.id !== id)
    }))
  }, [])

  const updateGoalProgress = useCallback((id: string, progress: number) => {
    setStore(prev => ({
      ...prev,
      goals: prev.goals.map(goal =>
        goal.id === id
          ? { ...goal, progress: Math.min(100, Math.max(0, progress)), updatedAt: new Date().toISOString() }
          : goal
      )
    }))
  }, [])

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setStore(prev => ({
      ...prev,
      goals: prev.goals.map(goal => {
        if (goal.id !== goalId) return goal

        const updatedMilestones = goal.milestones.map(m =>
          m.id === milestoneId
            ? {
              ...m,
              completed: !m.completed,
              completedAt: !m.completed ? new Date().toISOString() : undefined
            }
            : m
        )

        // Calculate progress based on completed milestones
        const completedCount = updatedMilestones.filter(m => m.completed).length
        const progress = goal.milestones.length > 0
          ? Math.round((completedCount / goal.milestones.length) * 100)
          : goal.progress

        return {
          ...goal,
          milestones: updatedMilestones,
          progress,
          updatedAt: new Date().toISOString()
        }
      })
    }))
  }, [])

  // ============================================
  // BOOKMARKS OPERATIONS
  // ============================================

  const addBookmark = useCallback((input: StudyBookmarkInput): string => {
    const bookmark = createBookmark(input)
    setStore(prev => ({
      ...prev,
      bookmarks: [bookmark, ...prev.bookmarks]
    }))
    return bookmark.id
  }, [])

  const deleteBookmark = useCallback((id: string) => {
    setStore(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(b => b.id !== id)
    }))
  }, [])

  const getBookmarksByType = useCallback((type: StudyBookmark['type']): StudyBookmark[] => {
    return store.bookmarks.filter(b => b.type === type)
  }, [store.bookmarks])

  // ============================================
  // PREFERENCES OPERATIONS
  // ============================================

  const updatePreferences = useCallback((updates: Partial<UserDataStore['preferences']>) => {
    setStore(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...updates
      }
    }))
  }, [])

  // ============================================
  // EXPORT / IMPORT
  // ============================================

  const exportData = useCallback((): string => {
    return JSON.stringify(store, null, 2)
  }, [store])

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString)
      // Validate basic structure
      if (!parsed.profile || !parsed.metadata) {
        throw new Error('Invalid data structure')
      }
      setStore({
        ...DEFAULT_USER_DATA_STORE,
        ...parsed
      })
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }, [])

  const clearAllData = useCallback(() => {
    setStore(DEFAULT_USER_DATA_STORE)
    localStorage.removeItem(STORE_KEY)
  }, [])

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    store,
    isLoaded,

    // Profile
    profile: store.profile,
    updateProfile,

    // Notes
    notes: store.notes,
    addNote,
    updateNote,
    deleteNote,
    toggleNotePin,
    getNotesByTag,
    getAllTags,

    // Memos
    memos: store.memos,
    addMemo,
    updateMemo,
    deleteMemo,
    toggleMemoComplete,
    getActiveMemos,

    // Custom Data
    customData: store.customData,
    addCustomData,
    updateCustomData,
    deleteCustomData,
    getCustomDataByCategory,
    getAllCategories,

    // Goals
    goals: store.goals,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    toggleMilestone,

    // Bookmarks
    bookmarks: store.bookmarks,
    addBookmark,
    deleteBookmark,
    getBookmarksByType,

    // Preferences
    preferences: store.preferences,
    updatePreferences,

    // Export/Import
    exportData,
    importData,
    clearAllData
  }
}

export type UserDataStoreReturn = ReturnType<typeof useUserDataStore>
