import { db, type Flashcard } from '../db'

// Deterministic pick based on date · same card for all users for a given day
export async function getDailyCard(): Promise<Flashcard | null> {
  const date = new Date().toISOString().slice(0, 10)
  const all = await db.flashcards.where('source').equals('generic').toArray()
  if (all.length === 0) return null
  // simple hash of YYYY-MM-DD to index
  let h = 0
  for (let i = 0; i < date.length; i++) h = (h * 31 + date.charCodeAt(i)) >>> 0
  return all[h % all.length]
}

export function isDailyAnswered(): boolean {
  return localStorage.getItem('genius-daily-' + new Date().toISOString().slice(0, 10)) !== null
}

export function markDailyAnswered(correct: boolean) {
  localStorage.setItem('genius-daily-' + new Date().toISOString().slice(0, 10), correct ? 'ok' : 'ko')
}
