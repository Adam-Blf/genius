import Dexie, { type Table } from 'dexie'

export type Category =
  | 'histoire'
  | 'sciences'
  | 'geo'
  | 'arts'
  | 'sports'
  | 'divers'

export interface Flashcard {
  id?: number
  uid: string
  question: string
  answer: string
  choices?: string[]
  category: Category
  source: 'generic' | 'user'
  chapterId?: string
  visibility?: 'private' | 'public-pending' // client-side flag, backend pending
  createdAt: number
}

export interface Attempt {
  id?: number
  cardUid: string
  correct: boolean
  at: number
}

export interface ChapterProgress {
  chapterId: string
  bestScore: number // 0..10
  attempts: number
  completedAt?: number
}

export interface Profile {
  id: number
  nickname: string
  xp: number
  streak: number
  lastActiveDay: string
  hearts: number
  heartsAt: number
}

class GeniusDB extends Dexie {
  flashcards!: Table<Flashcard, number>
  attempts!: Table<Attempt, number>
  profile!: Table<Profile, number>
  chapterProgress!: Table<ChapterProgress, string>

  constructor() {
    super('genius-db')
    this.version(1).stores({
      flashcards: '++id, uid, category, source, createdAt',
      attempts: '++id, cardUid, at',
      profile: 'id',
    })
    this.version(2).stores({
      flashcards: '++id, uid, category, source, chapterId, visibility, createdAt',
      attempts: '++id, cardUid, at',
      profile: 'id',
      chapterProgress: 'chapterId',
    })
  }
}

export const db = new GeniusDB()

export const today = () => new Date().toISOString().slice(0, 10)

export async function getOrCreateProfile(): Promise<Profile> {
  const p = await db.profile.get(1)
  if (p) return p
  const fresh: Profile = {
    id: 1,
    nickname: 'Genie',
    xp: 0,
    streak: 0,
    lastActiveDay: '',
    hearts: 5,
    heartsAt: Date.now(),
  }
  await db.profile.put(fresh)
  return fresh
}

export async function bumpStreakIfNewDay(): Promise<Profile> {
  const p = await getOrCreateProfile()
  const t = today()
  if (p.lastActiveDay === t) return p
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const newStreak = p.lastActiveDay === yesterday ? p.streak + 1 : 1
  const updated: Profile = { ...p, streak: newStreak, lastActiveDay: t }
  await db.profile.put(updated)
  return updated
}

export async function addXP(delta: number): Promise<Profile> {
  const p = await getOrCreateProfile()
  const updated: Profile = { ...p, xp: p.xp + delta }
  await db.profile.put(updated)
  return updated
}

export async function consumeHeart(): Promise<Profile> {
  const p = await getOrCreateProfile()
  const updated: Profile = { ...p, hearts: Math.max(0, p.hearts - 1), heartsAt: Date.now() }
  await db.profile.put(updated)
  return updated
}

export async function regenHeartsIfNeeded(): Promise<Profile> {
  const p = await getOrCreateProfile()
  if (p.hearts >= 5) return p
  const elapsed = Date.now() - p.heartsAt
  const regen = Math.floor(elapsed / (30 * 60 * 1000))
  if (regen <= 0) return p
  const newHearts = Math.min(5, p.hearts + regen)
  const updated: Profile = {
    ...p,
    hearts: newHearts,
    heartsAt: newHearts === 5 ? Date.now() : p.heartsAt + regen * 30 * 60 * 1000,
  }
  await db.profile.put(updated)
  return updated
}

export async function recordChapterScore(chapterId: string, score: number) {
  const existing = await db.chapterProgress.get(chapterId)
  const best = Math.max(existing?.bestScore ?? 0, score)
  await db.chapterProgress.put({
    chapterId,
    bestScore: best,
    attempts: (existing?.attempts ?? 0) + 1,
    completedAt: best >= 8 ? (existing?.completedAt ?? Date.now()) : existing?.completedAt,
  })
}
