import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { Flame, Heart, Zap, ChevronRight } from 'lucide-react'
import { db, getOrCreateProfile } from '../db'
import { motion } from 'framer-motion'

const CATEGORIES: Array<{ key: string; label: string; emoji: string; color: string }> = [
  { key: 'histoire', label: 'Histoire', emoji: '📜', color: 'bg-sun' },
  { key: 'sciences', label: 'Sciences', emoji: '🔬', color: 'bg-mint' },
  { key: 'geo', label: 'Geographie', emoji: '🌍', color: 'bg-grass' },
  { key: 'arts', label: 'Arts', emoji: '🎨', color: 'bg-plum' },
  { key: 'sports', label: 'Sports', emoji: '⚽', color: 'bg-blaze' },
  { key: 'divers', label: 'Divers', emoji: '🎲', color: 'bg-white/10' },
]

export function HomePage() {
  const profile = useLiveQuery(async () => getOrCreateProfile())
  const counts = useLiveQuery(async () => {
    const all = await db.flashcards.toArray()
    const byCat: Record<string, number> = {}
    all.forEach((c) => (byCat[c.category] = (byCat[c.category] || 0) + 1))
    return { total: all.length, byCat, userCount: all.filter((c) => c.source === 'user').length }
  })

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-6 safe-t">
      {/* top bar */}
      <header className="flex items-center justify-between mb-8">
        <div className="font-display text-3xl italic text-grass">
          genius<span className="text-white">.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-blaze font-bold">
            <Heart className="w-5 h-5 fill-blaze" />
            {profile?.hearts ?? 0}
          </span>
          <span className="flex items-center gap-1.5 text-sun font-bold">
            <Zap className="w-5 h-5 fill-sun" />
            {profile?.xp ?? 0}
          </span>
          <span className="flex items-center gap-1.5 text-blaze font-bold">
            <Flame className="w-5 h-5 fill-blaze" />
            {profile?.streak ?? 0}
          </span>
        </div>
      </header>

      {/* hero */}
      <section className="mb-8">
        <h1 className="font-display text-5xl leading-[1.05]">
          Salut <span className="italic text-grass">{profile?.nickname ?? 'Genie'}</span>.
        </h1>
        <p className="text-white/60 mt-3">
          {counts?.total ?? 0} cartes disponibles · {counts?.userCount ?? 0} perso.
        </p>
      </section>

      {/* CTA */}
      <Link
        to="/learn"
        className="btn-chunky block text-center mb-10"
        data-variant="grass"
      >
        Commencer une session
      </Link>

      {/* Categories */}
      <h2 className="font-display text-2xl mb-4">Categories</h2>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to={`/category/${cat.key}`}
              className="group block bg-surface border border-line rounded-2xl p-4 hover:border-white/20 transition"
            >
              <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center text-2xl shadow-soft mb-3`}>
                {cat.emoji}
              </div>
              <div className="font-bold">{cat.label}</div>
              <div className="text-xs text-white/50 mt-1 flex items-center justify-between">
                <span>{counts?.byCat[cat.key] ?? 0} cartes</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
