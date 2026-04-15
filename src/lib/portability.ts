import { db, type Flashcard } from '../db'

export interface ExportPayload {
  version: 1
  exportedAt: string
  cards: Omit<Flashcard, 'id'>[]
}

export async function exportUserCards(): Promise<Blob> {
  const cards = await db.flashcards.where('source').equals('user').toArray()
  const payload: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    cards: cards.map((c) => {
      const { id: _id, ...rest } = c
      return rest
    }),
  }
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function importUserCards(file: File): Promise<{ imported: number; skipped: number }> {
  const text = await file.text()
  const json = JSON.parse(text) as ExportPayload
  if (!json || json.version !== 1 || !Array.isArray(json.cards)) {
    throw new Error('Format invalide')
  }
  let imported = 0
  let skipped = 0
  const existing = new Set((await db.flashcards.toArray()).map((c) => c.uid))
  for (const c of json.cards) {
    if (existing.has(c.uid)) {
      skipped++
      continue
    }
    await db.flashcards.add({ ...c, source: 'user', createdAt: Date.now() })
    imported++
  }
  return { imported, skipped }
}
