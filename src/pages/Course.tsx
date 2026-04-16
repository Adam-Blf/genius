/**
 * Page Cours · affiche les faits clés du chapitre avant de lancer l'examen.
 *
 * Logique : on récupère les cartes du chapitre (seed paresseux si besoin) et
 * on les présente sous forme de "carte à retenir" (Q→R) avec un compteur de
 * lecture. Un bouton "Passer l'examen" route vers /learn/chapter/:id.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, BookOpen, GraduationCap, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { db, type Flashcard } from '../db'
import { CHAPTERS } from '../chapters'
import { ensureChapterSeeded } from '../lib/generated'

export function CoursePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const chapter = CHAPTERS.find((c) => c.id === id)
  const [readTime, setReadTime] = useState(0)

  useEffect(() => {
    if (id) void ensureChapterSeeded(id)
  }, [id])

  const cards = useLiveQuery(async (): Promise<Flashcard[]> => {
    if (!chapter || !id) return []
    if (chapter.cardUids?.length) {
      const all = await db.flashcards.toArray()
      return chapter.cardUids
        .map((uid) => all.find((c) => c.uid === uid))
        .filter((c): c is Flashcard => !!c)
    }
    return db.flashcards.where('chapterId').equals(id).toArray()
  }, [id]) ?? []

  useEffect(() => {
    const t = setInterval(() => setReadTime((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [])

  if (!chapter) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-10">
        <p>Chapitre introuvable.</p>
        <button onClick={() => navigate('/')} className="btn-chunky mt-4" data-variant="elephant">Retour</button>
      </div>
    )
  }

  const cardCount = cards.length || (chapter.cardUids?.length ?? chapter.cardCount ?? 0)
  const minSeconds = Math.max(10, Math.min(60, cardCount * 2))
  const ready = readTime >= minSeconds

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-28 safe-t">
      <button
        onClick={() => navigate(`/chapter/${chapter.id}`)}
        className="flex items-center gap-2 text-white/60 hover:text-white mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Chapitre</span>
      </button>

      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{chapter.emoji}</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-elephant-300 mb-1">
          Cours · chapitre {chapter.order}
        </div>
        <h1 className="font-display text-3xl">{chapter.title}</h1>
        <p className="text-white/60 mt-1 text-sm">{chapter.subtitle}</p>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-4 mb-5 flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-elephant-300 shrink-0" />
        <p className="text-sm text-white/80 leading-relaxed">
          Lis attentivement les {cardCount} faits ci-dessous, puis passe l'examen (10 questions).
        </p>
      </div>

      <h2 className="font-display text-xl mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-sun" />
        À retenir
      </h2>

      <div className="space-y-3 mb-8">
        {cards.map((c, i) => (
          <motion.div
            key={c.id ?? c.uid}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.4) }}
            className="bg-surface border border-line rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <span className="font-mono text-[11px] text-white/40 mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white/70">{c.question}</div>
                <div className="text-elephant-300 font-semibold mt-1">→ {c.answer}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-ink/95 backdrop-blur border-t border-line p-4 safe-b">
        <div className="max-w-lg mx-auto">
          {!ready ? (
            <div className="text-center text-xs text-white/50 mb-2">
              Prends au moins {minSeconds}s pour lire · {Math.max(0, minSeconds - readTime)}s restantes
            </div>
          ) : null}
          <Link
            to={`/learn/chapter/${chapter.id}`}
            className={`btn-chunky block text-center ${ready ? '' : 'pointer-events-none opacity-50'}`}
            data-variant="elephant"
            aria-disabled={!ready}
          >
            <span className="inline-flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Passer l'examen
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
