import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, getOrCreateProfile } from '../db'
import { Flame, Heart, Zap, Trophy, Pencil, Check } from 'lucide-react'

export function ProfilePage() {
  const profile = useLiveQuery(async () => getOrCreateProfile())
  const stats = useLiveQuery(async () => {
    const attempts = await db.attempts.toArray()
    const correct = attempts.filter((a) => a.correct).length
    const total = attempts.length
    return { total, correct, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 }
  })
  const [editing, setEditing] = useState(false)
  const [nick, setNick] = useState('')

  const saveNick = async () => {
    if (!profile) return
    const v = nick.trim() || 'Genie'
    await db.profile.put({ ...profile, nickname: v })
    setEditing(false)
  }

  const badges = [
    { key: 'first', label: 'Premier pas', emoji: '🌱', unlocked: (stats?.total ?? 0) >= 1 },
    { key: 'ten', label: '10 questions', emoji: '🔟', unlocked: (stats?.total ?? 0) >= 10 },
    { key: 'fifty', label: '50 questions', emoji: '🎯', unlocked: (stats?.total ?? 0) >= 50 },
    { key: 'streak3', label: 'Serie 3 jours', emoji: '🔥', unlocked: (profile?.streak ?? 0) >= 3 },
    { key: 'streak7', label: 'Serie 7 jours', emoji: '💎', unlocked: (profile?.streak ?? 0) >= 7 },
    { key: 'perfect', label: '90% reussite', emoji: '🏆', unlocked: (stats?.accuracy ?? 0) >= 90 && (stats?.total ?? 0) >= 10 },
  ]

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-6 safe-t">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-grass to-mint flex items-center justify-center font-display text-3xl italic">
          {(profile?.nickname ?? 'G').charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                maxLength={20}
                className="flex-1 bg-surface border border-line rounded-xl px-3 py-2 outline-none focus:border-grass text-lg font-bold"
              />
              <button onClick={saveNick} className="p-2 bg-grass rounded-xl">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl truncate">{profile?.nickname}</h1>
              <button
                onClick={() => { setNick(profile?.nickname ?? ''); setEditing(true) }}
                className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-white/50 text-sm">Apprenti du savoir</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-surface border border-line rounded-2xl p-4">
          <Zap className="w-5 h-5 text-sun mb-2 fill-sun" />
          <div className="font-display text-3xl">{profile?.xp ?? 0}</div>
          <div className="text-xs text-white/50 mt-1">XP total</div>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-4">
          <Flame className="w-5 h-5 text-blaze mb-2 fill-blaze" />
          <div className="font-display text-3xl">{profile?.streak ?? 0}<span className="text-sm text-white/50"> j</span></div>
          <div className="text-xs text-white/50 mt-1">Serie en cours</div>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-4">
          <Heart className="w-5 h-5 text-blaze mb-2 fill-blaze" />
          <div className="font-display text-3xl">{profile?.hearts ?? 0}<span className="text-sm text-white/50"> / 5</span></div>
          <div className="text-xs text-white/50 mt-1">Vies restantes</div>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-4">
          <Trophy className="w-5 h-5 text-grass mb-2" />
          <div className="font-display text-3xl">{stats?.accuracy ?? 0}<span className="text-sm text-white/50">%</span></div>
          <div className="text-xs text-white/50 mt-1">Reussite ({stats?.total ?? 0} Q)</div>
        </div>
      </div>

      {/* Badges */}
      <h2 className="font-display text-2xl mb-4">Badges</h2>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((b) => (
          <div
            key={b.key}
            className={`rounded-2xl p-3 border text-center transition ${
              b.unlocked
                ? 'bg-surface border-grass/40'
                : 'bg-surface/50 border-line opacity-40'
            }`}
          >
            <div className="text-3xl mb-1">{b.emoji}</div>
            <div className="text-xs font-semibold">{b.label}</div>
          </div>
        ))}
      </div>

      {/* Reset */}
      <div className="mt-10 pt-6 border-t border-line">
        <button
          onClick={async () => {
            if (confirm('Reinitialiser tes stats et cartes perso ?')) {
              await db.attempts.clear()
              await db.flashcards.where('source').equals('user').delete()
              await db.profile.put({ id: 1, nickname: 'Genie', xp: 0, streak: 0, lastActiveDay: '', hearts: 5, heartsAt: Date.now() })
            }
          }}
          className="text-sm text-white/40 hover:text-blaze transition"
        >
          Reinitialiser mes donnees
        </button>
      </div>
    </div>
  )
}
