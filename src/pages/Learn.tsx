import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Check } from 'lucide-react'
import { db, addXP, consumeHeart, bumpStreakIfNewDay, type Flashcard, type Category } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function LearnPage() {
  const { scope } = useParams<{ scope?: string }>()
  const navigate = useNavigate()
  const cards = useLiveQuery(async () => {
    const all = await db.flashcards.toArray()
    const filtered = scope ? all.filter((c) => c.category === (scope as Category)) : all
    return shuffle(filtered).slice(0, 10)
  }, [scope])

  const profile = useLiveQuery(async () => await db.profile.get(1))

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  const current = cards?.[idx]

  const choices = useMemo(() => {
    if (!current) return []
    const base = current.choices && current.choices.length ? current.choices : [current.answer]
    return shuffle(base)
  }, [current])

  useEffect(() => {
    setSelected(null)
    setRevealed(false)
  }, [idx])

  if (!cards) return null
  if (cards.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-20 text-center">
        <h2 className="font-display text-3xl mb-2">Pas encore de cartes</h2>
        <p className="text-white/60 mb-6">Ajoute-en depuis l'onglet Creer.</p>
        <button onClick={() => navigate('/add')} className="btn-chunky" data-variant="grass">
          Creer une carte
        </button>
      </div>
    )
  }

  if (idx >= cards.length) {
    const pct = Math.round((correctCount / cards.length) * 100)
    return (
      <div className="max-w-lg mx-auto px-5 pt-16 text-center">
        <div className="text-7xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '🎯' : '💪'}</div>
        <h2 className="font-display text-4xl mb-2">Session terminee.</h2>
        <p className="text-white/70 mb-8">
          {correctCount} / {cards.length} correctes · <span className="text-grass font-bold">+{correctCount * 10} XP</span>
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={() => { setIdx(0); setCorrectCount(0) }} className="btn-chunky" data-variant="grass">
            Rejouer
          </button>
          <button onClick={() => navigate('/')} className="btn-chunky" data-variant="ghost">
            Retour accueil
          </button>
        </div>
      </div>
    )
  }

  if (!current) return null

  const handleChoose = (c: string) => {
    if (revealed) return
    setSelected(c)
    setRevealed(true)
    const correct = c === current.answer
    db.attempts.add({ cardUid: current.uid, correct, at: Date.now() })
    if (correct) {
      setCorrectCount((x) => x + 1)
      addXP(10)
    } else {
      consumeHeart()
    }
    if (idx === cards.length - 1) bumpStreakIfNewDay()
  }

  const progress = ((idx + (revealed ? 1 : 0)) / cards.length) * 100
  const hearts = profile?.hearts ?? 0

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-6 min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-grass rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <span className="flex items-center gap-1 font-bold text-blaze">
          <Heart className="w-5 h-5 fill-blaze" />
          {hearts}
        </span>
      </div>

      {/* Prompt */}
      <div className="flex-1 flex flex-col">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-3">
          Question {idx + 1} / {cards.length}
        </div>
        <AnimatePresence mode="wait">
          <motion.h2
            key={current.uid}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="font-display text-3xl leading-snug mb-8"
          >
            {current.question}
          </motion.h2>
        </AnimatePresence>

        {/* Choices */}
        <div className="space-y-3 mt-auto">
          {choices.map((c) => {
            const isCorrect = c === current.answer
            const state = revealed
              ? isCorrect
                ? 'correct'
                : c === selected
                ? 'wrong'
                : 'idle'
              : selected === c
              ? 'selected'
              : 'idle'
            const cls =
              state === 'correct'
                ? 'border-grass bg-grass/10'
                : state === 'wrong'
                ? 'border-blaze bg-blaze/10'
                : state === 'selected'
                ? 'border-mint bg-mint/10'
                : 'border-line bg-surface hover:border-white/20'
            return (
              <button
                key={c}
                onClick={() => handleChoose(c)}
                disabled={revealed}
                className={`w-full text-left rounded-2xl border-2 px-5 py-4 font-semibold transition ${cls}`}
              >
                <span className="flex items-center justify-between">
                  {c}
                  {state === 'correct' && <Check className="w-5 h-5 text-grass" />}
                  {state === 'wrong' && <X className="w-5 h-5 text-blaze" />}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`mt-5 rounded-2xl p-4 ${
              selected === current.answer ? 'bg-grass/10 border border-grass/30' : 'bg-blaze/10 border border-blaze/30'
            }`}
          >
            <div className="font-bold mb-1">
              {selected === current.answer ? 'Bravo !' : 'Raté'}
            </div>
            <div className="text-sm text-white/70">
              Reponse · <span className="font-bold text-white">{current.answer}</span>
            </div>
            <button
              onClick={() => setIdx((x) => x + 1)}
              className="btn-chunky mt-4 w-full"
              data-variant={selected === current.answer ? 'grass' : 'blaze'}
            >
              Suivant
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
