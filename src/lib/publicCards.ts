import { supabase, type PublicCard } from './supabase'
import { db, type Flashcard } from '../db'

export async function publishPendingCards(userId: string): Promise<{ published: number; failed: number }> {
  if (!supabase) return { published: 0, failed: 0 }
  const pending = await db.flashcards
    .where('source').equals('user')
    .filter((c) => c.visibility === 'public-pending')
    .toArray()
  if (pending.length === 0) return { published: 0, failed: 0 }

  const rows = pending.map((c) => ({
    author_id: userId,
    uid: c.uid,
    question: c.question,
    answer: c.answer,
    choices: c.choices ?? null,
    category: c.category,
    chapter_id: c.chapterId ?? null,
  }))
  const { error } = await supabase.from('public_cards').upsert(rows, { onConflict: 'author_id,uid' })
  if (error) {
    console.error('publish failed', error)
    return { published: 0, failed: pending.length }
  }
  // Mark as public (published) locally
  await Promise.all(
    pending.map((c) => db.flashcards.update(c.id!, { visibility: 'private' as const }))
  )
  return { published: pending.length, failed: 0 }
}

export async function fetchPublicCards(limit = 50): Promise<PublicCard[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('public_cards')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) { console.error(error); return [] }
  return data as PublicCard[]
}

export async function importPublicCardsToLocal(cards: PublicCard[]): Promise<number> {
  let n = 0
  const existing = new Set((await db.flashcards.toArray()).map((c) => c.uid))
  for (const c of cards) {
    const localUid = `pub-${c.id}`
    if (existing.has(localUid)) continue
    const f: Omit<Flashcard, 'id'> = {
      uid: localUid,
      question: c.question,
      answer: c.answer,
      choices: c.choices ?? undefined,
      category: c.category as Flashcard['category'],
      source: 'generic',
      chapterId: c.chapter_id ?? undefined,
      visibility: 'private',
      createdAt: new Date(c.created_at).getTime(),
    }
    await db.flashcards.add(f)
    n++
  }
  return n
}
