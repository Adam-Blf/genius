import { useState } from 'react'
import { db, type Category } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CATS: Array<{ key: Category; label: string; emoji: string }> = [
  { key: 'histoire', label: 'Histoire', emoji: '📜' },
  { key: 'sciences', label: 'Sciences', emoji: '🔬' },
  { key: 'geo', label: 'Geo', emoji: '🌍' },
  { key: 'arts', label: 'Arts', emoji: '🎨' },
  { key: 'sports', label: 'Sports', emoji: '⚽' },
  { key: 'divers', label: 'Divers', emoji: '🎲' },
]

export function AddCardPage() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [distractors, setDistractors] = useState<string[]>(['', '', ''])
  const [category, setCategory] = useState<Category>('divers')
  const [toast, setToast] = useState<string | null>(null)

  const userCards = useLiveQuery(async () =>
    await db.flashcards.where('source').equals('user').reverse().sortBy('createdAt')
  )

  const canSubmit = question.trim().length > 3 && answer.trim().length > 0

  const onSubmit = async () => {
    if (!canSubmit) return
    const choices = [answer, ...distractors.filter((d) => d.trim().length > 0)]
    await db.flashcards.add({
      uid: `u-${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
      choices: choices.length > 1 ? choices : undefined,
      category,
      source: 'user',
      createdAt: Date.now(),
    })
    setQuestion('')
    setAnswer('')
    setDistractors(['', '', ''])
    setToast('Carte ajoutee')
    setTimeout(() => setToast(null), 1500)
  }

  const onDelete = async (id: number) => {
    await db.flashcards.delete(id)
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-6 safe-t">
      <h1 className="font-display text-4xl mb-2">
        Creer une <span className="italic text-grass">carte</span>.
      </h1>
      <p className="text-white/60 mb-8">Ajoute tes propres questions. Stockees localement.</p>

      <div className="space-y-4 mb-10">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 block">
            Question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="En quelle annee... ?"
            rows={2}
            className="w-full bg-surface border border-line rounded-2xl px-4 py-3 outline-none focus:border-grass transition resize-none"
          />
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 block">
            Bonne reponse
          </label>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="La bonne reponse"
            className="w-full bg-surface border border-line rounded-2xl px-4 py-3 outline-none focus:border-grass transition"
          />
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 block">
            Mauvaises reponses (optionnel)
          </label>
          <div className="space-y-2">
            {distractors.map((d, i) => (
              <input
                key={i}
                value={d}
                onChange={(e) => {
                  const next = [...distractors]
                  next[i] = e.target.value
                  setDistractors(next)
                }}
                placeholder={`Distracteur ${i + 1}`}
                className="w-full bg-surface border border-line rounded-2xl px-4 py-3 outline-none focus:border-mint transition"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 block">
            Categorie
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATS.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`p-3 rounded-2xl border-2 transition ${
                  category === c.key
                    ? 'border-grass bg-grass/10'
                    : 'border-line bg-surface hover:border-white/20'
                }`}
              >
                <div className="text-xl">{c.emoji}</div>
                <div className="text-xs font-semibold mt-1">{c.label}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="btn-chunky w-full disabled:opacity-40 disabled:active:translate-y-0"
          data-variant="grass"
        >
          Ajouter
        </button>
      </div>

      {/* Liste cartes perso */}
      <section>
        <h2 className="font-display text-2xl mb-4">Tes cartes ({userCards?.length ?? 0})</h2>
        {userCards && userCards.length === 0 && (
          <p className="text-white/50 text-sm">Aucune carte pour l'instant.</p>
        )}
        <div className="space-y-2">
          {userCards?.map((c) => (
            <div key={c.id} className="bg-surface border border-line rounded-2xl p-4 flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{c.question}</div>
                <div className="text-xs text-grass mt-1">→ {c.answer}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mt-2">
                  {c.category}
                </div>
              </div>
              <button
                onClick={() => onDelete(c.id!)}
                className="p-2 text-white/50 hover:text-blaze hover:bg-blaze/10 rounded-xl transition"
                aria-label="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-grass text-white font-bold px-5 py-3 rounded-2xl shadow-btn-grass"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
