import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Play, Check, Target } from 'lucide-react'
import { useEffect } from 'react'
import { db } from '../db'
import { CHAPTERS } from '../chapters'
import { ensureChapterSeeded } from '../lib/generated'

export function ChapterPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const chapter = CHAPTERS.find((c) => c.id === id)
  // Seed paresseux : garantit que les cartes de ce chapitre sont en Dexie.
  useEffect(() => { if (id) void ensureChapterSeeded(id) }, [id])
  const progress = useLiveQuery(async () => id ? await db.chapterProgress.get(id) : undefined, [id])
  const cards = useLiveQuery(async () => {
    if (!chapter || !id) return []
    // Chapitres curés : lookup par cardUids. Chapitres générés : query par chapterId.
    if (chapter.cardUids?.length) {
      const all = await db.flashcards.toArray()
      return chapter.cardUids.map((uid) => all.find((c) => c.uid === uid)).filter(Boolean)
    }
    await ensureChapterSeeded(id)
    return db.flashcards.where('chapterId').equals(id).toArray()
  }, [id])

  if (!chapter) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-10">
        <p>Chapitre introuvable.</p>
        <button onClick={() => navigate('/')} className="btn-chunky mt-4" data-variant="elephant">Retour</button>
      </div>
    )
  }

  const done = (progress?.completedAt ?? 0) > 0

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-6 safe-t">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-white/60 hover:text-white mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Parcours</span>
      </button>

      <div className="text-center mb-8">
        <div className="text-7xl mb-4">{chapter.emoji}</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-elephant-300 mb-2">
          Chapitre {chapter.order}
        </div>
        <h1 className="font-display text-4xl">{chapter.title}</h1>
        <p className="text-white/60 mt-2">{chapter.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        <div className="bg-surface border border-line rounded-2xl p-3 text-center">
          <Target className="w-4 h-4 text-elephant-300 mx-auto mb-1" />
          <div className="font-display text-2xl">{(chapter.cardUids?.length ?? chapter.cardCount ?? 0)}</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">Questions</div>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-3 text-center">
          <div className="font-display text-2xl text-sun">{progress?.bestScore ?? 0}<span className="text-sm text-white/50">/10</span></div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/50 mt-1">Meilleur</div>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-3 text-center">
          {done ? <Check className="w-4 h-4 text-leaf mx-auto mb-1" /> : <Target className="w-4 h-4 text-white/40 mx-auto mb-1" />}
          <div className="font-display text-2xl">{progress?.attempts ?? 0}</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">Tentatives</div>
        </div>
      </div>

      <Link to={`/learn/chapter/${chapter.id}`} className="btn-chunky block text-center mb-10" data-variant="elephant">
        <span className="inline-flex items-center gap-2">
          <Play className="w-4 h-4 fill-white" />
          {done ? 'Rejouer' : 'Commencer'}
        </span>
      </Link>

      <h2 className="font-display text-2xl mb-4">Questions de ce chapitre</h2>
      <div className="space-y-2">
        {cards?.map((c) => c && (
          <div key={c.id} className="bg-surface border border-line rounded-2xl p-4">
            <div className="font-semibold text-sm">{c.question}</div>
            <div className="text-elephant-300 text-sm mt-1">→ {c.answer}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
