import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Check, X } from 'lucide-react'
import { addXP } from '../db'
import { getDailyCard, isDailyAnswered, markDailyAnswered } from '../lib/daily'
import { feedbackCorrect, feedbackWrong } from '../lib/feedback'
import type { Flashcard } from '../db'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function DailyPage() {
  const navigate = useNavigate()
  const [card, setCard] = useState<Flashcard | null>(null)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    getDailyCard().then(setCard)
    setAlreadyDone(isDailyAnswered())
  }, [])

  const choices = useMemo(() => {
    if (!card) return []
    const base = card.choices && card.choices.length ? card.choices : [card.answer]
    return shuffle(base)
  }, [card])

  const handleChoose = (c: string) => {
    if (!card || revealed) return
    setSelected(c)
    setRevealed(true)
    const correct = c === card.answer
    markDailyAnswered(correct)
    if (correct) {
      addXP(25) // bonus
      feedbackCorrect()
    } else {
      feedbackWrong()
    }
  }

  if (alreadyDone) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-10 pb-6 safe-t text-center">
        <button onClick={() => navigate('/')} className="absolute left-5 top-10 flex items-center gap-2 text-white/60"><ArrowLeft className="w-5 h-5" /><span className="text-sm">Retour</span></button>
        <Calendar className="w-12 h-12 text-sun mx-auto mt-10 mb-4" />
        <h1 className="font-display text-4xl mb-2">Deja fait.</h1>
        <p className="text-white/60">Tu as deja joue ton defi du jour · reviens demain pour une nouvelle question.</p>
      </div>
    )
  }

  if (!card) return <div className="pt-20 text-center text-white/50">Chargement...</div>

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-6 safe-t">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/60 hover:text-white mb-6">
        <ArrowLeft className="w-5 h-5" /><span className="text-sm">Retour</span>
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-sun/10 border border-sun/30 rounded-full px-3 py-1 mb-4">
          <Calendar className="w-3 h-3 text-sun" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sun">Defi du jour · +25 XP</span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl leading-snug mb-8">
        {card.question}
      </motion.h2>

      <div className="space-y-3">
        {choices.map((c, i) => {
          const isCorrect = c === card.answer
          const state = revealed ? (isCorrect ? 'correct' : c === selected ? 'wrong' : 'idle') : selected === c ? 'selected' : 'idle'
          const cls = state === 'correct' ? 'border-leaf bg-leaf/10' : state === 'wrong' ? 'border-blaze bg-blaze/10' : state === 'selected' ? 'border-elephant-400 bg-elephant-500/10' : 'border-line bg-surface hover:border-white/20'
          return (
            <button key={c} onClick={() => handleChoose(c)} disabled={revealed} className={`w-full text-left rounded-2xl border-2 px-5 py-4 font-semibold transition ${cls}`}>
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <kbd className="font-mono text-[10px] text-white/40 border border-line rounded px-1.5 py-0.5">{i + 1}</kbd>
                  {c}
                </span>
                {state === 'correct' && <Check className="w-5 h-5 text-leaf" />}
                {state === 'wrong' && <X className="w-5 h-5 text-blaze" />}
              </span>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`mt-5 rounded-2xl p-4 ${selected === card.answer ? 'bg-leaf/10 border border-leaf/30' : 'bg-blaze/10 border border-blaze/30'}`}>
            <div className="font-bold mb-1">{selected === card.answer ? 'Bravo ! +25 XP' : 'Raté'}</div>
            <div className="text-sm text-white/70">Reponse · <span className="font-bold text-white">{card.answer}</span></div>
            <button onClick={() => navigate('/')} className="btn-chunky mt-4 w-full" data-variant="elephant">Retour</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
