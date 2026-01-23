/**
 * User Data Types for Genius App
 * Flexible Local-First Data Schema
 */

// ============================================
// BASE TYPES
// ============================================

export interface UserNote {
  id: string
  title: string
  content: string
  tags: string[]
  color?: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface UserMemo {
  id: string
  text: string
  category?: string
  reminderAt?: string
  isCompleted: boolean
  createdAt: string
}

// Flexible custom data entry - can store ANY type of information
export interface CustomDataEntry {
  id: string
  label: string
  value: string | number | boolean | string[]
  type: 'text' | 'number' | 'boolean' | 'date' | 'list' | 'url' | 'json'
  category?: string
  icon?: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

// User learning goals
export interface LearningGoal {
  id: string
  title: string
  description?: string
  targetDate?: string
  progress: number // 0-100
  milestones: {
    id: string
    title: string
    completed: boolean
    completedAt?: string
  }[]
  createdAt: string
  updatedAt: string
}

// Study session bookmark
export interface StudyBookmark {
  id: string
  type: 'category' | 'question' | 'flashcard_set' | 'trivia'
  referenceId: string
  title: string
  notes?: string
  createdAt: string
}

// ============================================
// MAIN USER DATA STORE
// ============================================

export interface UserDataStore {
  // Core profile data
  profile: {
    nickname?: string
    avatarEmoji?: string
    favoriteSubjects: string[]
    learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic'
    dailyGoalMinutes: number
    preferredDifficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  }

  // Notes system - flexible text storage
  notes: UserNote[]

  // Quick memos - short reminders
  memos: UserMemo[]

  // Custom data - any arbitrary information
  customData: CustomDataEntry[]

  // Learning goals
  goals: LearningGoal[]

  // Bookmarks
  bookmarks: StudyBookmark[]

  // Preferences
  preferences: {
    theme: 'dark' | 'light' | 'system'
    soundEnabled: boolean
    hapticEnabled: boolean
    notificationsEnabled: boolean
    streakReminders: boolean
    weeklyDigest: boolean
    language: 'fr' | 'en'
    llmProvider?: 'huggingface' | 'groq' | 'together' | 'ollama' | 'openrouter' | 'none'
    llmApiKey?: string // Encrypted in storage
  }

  // Metadata
  metadata: {
    version: number
    lastSyncAt?: string
    createdAt: string
    updatedAt: string
  }
}

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_USER_PROFILE: UserDataStore['profile'] = {
  nickname: undefined,
  avatarEmoji: undefined,
  favoriteSubjects: [],
  learningStyle: undefined,
  dailyGoalMinutes: 15,
  preferredDifficulty: 'mixed'
}

export const DEFAULT_PREFERENCES: UserDataStore['preferences'] = {
  theme: 'dark',
  soundEnabled: true,
  hapticEnabled: true,
  notificationsEnabled: true,
  streakReminders: true,
  weeklyDigest: false,
  language: 'fr',
  llmProvider: 'none',
  llmApiKey: undefined
}

export const DEFAULT_USER_DATA_STORE: UserDataStore = {
  profile: DEFAULT_USER_PROFILE,
  notes: [],
  memos: [],
  customData: [],
  goals: [],
  bookmarks: [],
  preferences: DEFAULT_PREFERENCES,
  metadata: {
    version: 1,
    lastSyncAt: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// ============================================
// HELPER TYPES
// ============================================

export type UserNoteInput = Omit<UserNote, 'id' | 'createdAt' | 'updatedAt'>
export type UserMemoInput = Omit<UserMemo, 'id' | 'createdAt'>
export type CustomDataInput = Omit<CustomDataEntry, 'id' | 'createdAt' | 'updatedAt'>
export type LearningGoalInput = Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>
export type StudyBookmarkInput = Omit<StudyBookmark, 'id' | 'createdAt'>

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function createNote(input: UserNoteInput): UserNote {
  const now = new Date().toISOString()
  return {
    ...input,
    id: generateId('note'),
    createdAt: now,
    updatedAt: now
  }
}

export function createMemo(input: UserMemoInput): UserMemo {
  return {
    ...input,
    id: generateId('memo'),
    createdAt: new Date().toISOString()
  }
}

export function createCustomData(input: CustomDataInput): CustomDataEntry {
  const now = new Date().toISOString()
  return {
    ...input,
    id: generateId('data'),
    createdAt: now,
    updatedAt: now
  }
}

export function createGoal(input: LearningGoalInput): LearningGoal {
  const now = new Date().toISOString()
  return {
    ...input,
    id: generateId('goal'),
    createdAt: now,
    updatedAt: now
  }
}

export function createBookmark(input: StudyBookmarkInput): StudyBookmark {
  return {
    ...input,
    id: generateId('bookmark'),
    createdAt: new Date().toISOString()
  }
}
