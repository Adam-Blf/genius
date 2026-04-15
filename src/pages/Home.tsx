import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { Flame, Heart, Zap, Lock, Check, ChevronRight } from 'lucide-react'
import { db, getOrCreateProfile } from '../db'
import { CHAPTERS, chapterState } from '../chapters'
import { motion } from 'framer-motion'

export function HomePage() {
  const profile = useLiveQuery(async () => getOrCreateProfile())
  const progressRows = useLiveQuery(async () => await db.chapterProgress.toArray())
  const completedIds = new Set(
    (progressRows ?? []).filter((p) => (p.completedAt ?? 0) > 0).map((p) => p.chapterId)
  )
  const currentChapter = CHAPTERS.find((c) => chapterState(c, completedIds) === 'current')

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-6 safe-t">
      {/* Top bar */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🐘</span>
          <div className="font-display text-3xl italic text-elephant-300">
            genius<span className="text-white">.</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-blaze font-bold">
            <Heart className="w-4 h-4 fill-blaze" />
            {profile?.hearts ?? 0}
          </span>
          <span className="flex items-center gap-1 text-sun font-bold">
            <Zap className="w-4 h-4 fill-sun" />
            {profile?.xp ?? 0}
          </span>
          <span className="flex items-center gap-1 text-elephant-300 font-bold">
            <Flame className="w-4 h-4" />
            {profile?.streak ?? 0}
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="mb-8">
        <h1 className="font-display text-5xl leading-[1.05]">
          Salut <span className="italic text-elephant-300">{profile?.nickname ?? 'Genie'}</span>.
        </h1>
        <p className="text-white/60 mt-3">
          {currentChapter
            ? `Chapitre ${currentChapter.order} · ${currentChapter.title}`
            : 'Tous les chapitres termines. Bravo.'}
        </p>
      </section>

      {/* Roadmap path */}
      <h2 className="font-display text-2xl mb-4">Parcours</h2>
      <div className="relative">
        {CHAPTERS.map((ch, i) => {
          const state = chapterState(ch, completedIds)
          const prog = progressRows?.find((p) => p.chapterId === ch.id)
          const align = i % 2 === 0 ? 'justify-start' : 'justify-end'
          const isLocked = state === 'locked'
          return (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex ${align} mb-6`}
            >
              <Link
                to={isLocked ? '#' : `/chapter/${ch.id}`}
                onClick={(e) => isLocked && e.preventDefault()}
                className={`flex items-center gap-4 max-w-[85%] ${
                  isLocked ? 'cursor-not-allowed opacity-70' : ''
                }`}
              >
                {i % 2 === 0 ? (
                  <>
                    <div className={`node-circle node-${state}`}>
                      {state === 'done' ? <Check className="w-6 h-6" /> : state === 'locked' ? <Lock className="w-5 h-5" /> : ch.emoji}
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                        Chapitre {ch.order}
                      </div>
                      <div className="font-display text-xl">{ch.title}</div>
                      <div className="text-xs text-white/50">
                        {ch.cardUids.length} cartes · Meilleur {prog?.bestScore ?? 0}/10
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-right">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                        Chapitre {ch.order}
                      </div>
                      <div className="font-display text-xl">{ch.title}</div>
                      <div className="text-xs text-white/50">
                        {ch.cardUids.length} cartes · Meilleur {prog?.bestScore ?? 0}/10
                      </div>
                    </div>
                    <div className={`node-circle node-${state}`}>
                      {state === 'done' ? <Check className="w-6 h-6" /> : state === 'locked' ? <Lock className="w-5 h-5" /> : ch.emoji}
                    </div>
                  </>
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Free play */}
      <div className="mt-10 pt-6 border-t border-line">
        <Link
          to="/learn"
          className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-line hover:border-white/20 transition"
        >
          <div>
            <div className="font-semibold">Session libre</div>
            <div className="text-xs text-white/50">10 questions tirees au hasard (hors parcours)</div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/50" />
        </Link>
      </div>
    </div>
  )
}
