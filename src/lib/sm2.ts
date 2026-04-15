/**
 * Spaced repetition · SM-2 simplifie.
 * Pour chaque carte on garde · easiness (EF), interval (jours), lastAt, nextAt.
 * Quality 0-5 : <3 = rate (reset), >=3 = correct (augmente interval).
 */

import { db } from '../db'

export interface SRSEntry {
  uid: string
  ef: number       // easiness factor
  interval: number // days
  reps: number
  lastAt: number
  nextAt: number
}

// Store via simple Dexie table ? We piggyback on a singleton JSON in Profile for simplicity,
// but cleaner · dedicated table. We use a JSON store via localStorage · fast enough for client-side.

const KEY = 'genius-srs-v1'

function load(): Record<string, SRSEntry> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, SRSEntry>
  } catch { return {} }
}

function save(db: Record<string, SRSEntry>) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

export function review(uid: string, quality: number) {
  const entries = load()
  const e = entries[uid] ?? { uid, ef: 2.5, interval: 0, reps: 0, lastAt: 0, nextAt: 0 }
  if (quality < 3) {
    e.reps = 0
    e.interval = 1
  } else {
    e.reps += 1
    if (e.reps === 1) e.interval = 1
    else if (e.reps === 2) e.interval = 3
    else e.interval = Math.round(e.interval * e.ef)
    e.ef = Math.max(1.3, e.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  }
  e.lastAt = Date.now()
  e.nextAt = e.lastAt + e.interval * 86400000
  entries[uid] = e
  save(entries)
}

export function getDue(limit = 10): string[] {
  const entries = load()
  const now = Date.now()
  return Object.values(entries)
    .filter((e) => e.nextAt <= now)
    .sort((a, b) => a.nextAt - b.nextAt)
    .slice(0, limit)
    .map((e) => e.uid)
}

export function stats() {
  const entries = Object.values(load())
  const now = Date.now()
  const due = entries.filter((e) => e.nextAt <= now).length
  const learned = entries.filter((e) => e.reps >= 2).length
  return { total: entries.length, due, learned }
}

export async function getDueCards(limit = 10) {
  const dueUids = getDue(limit)
  if (dueUids.length === 0) return []
  const all = await db.flashcards.toArray()
  return dueUids.map((u) => all.find((c) => c.uid === u)).filter(Boolean) as typeof all
}
