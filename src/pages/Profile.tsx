import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, getOrCreateProfile } from '../db'
import { CHAPTERS } from '../chapters'
import { Flame, Heart, Zap, Trophy, Pencil, Check, Linkedin, Share2, Settings as SettingsIcon, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Sparkline } from '../components/Sparkline'

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://genius.adam.beloucif.com'

function shareToLinkedIn(title: string, summary: string) {
  const url = APP_URL
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  const textUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${title}\n\n${summary}\n\n${url}`)}`
  window.open(textUrl, '_blank', 'noopener')
  void shareUrl
}

export function ProfilePage() {
  const profile = useLiveQuery(async () => getOrCreateProfile())
  const stats = useLiveQuery(async () => {
    const attempts = await db.attempts.toArray()
    const correct = attempts.filter((a) => a.correct).length
    const total = attempts.length
    return { total, correct, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 }
  })
  const chapterRows = useLiveQuery(async () => await db.chapterProgress.toArray())
  const last30 = useLiveQuery(async () => {
    const now = Date.now()
    const startOfDayMs = 24 * 3600 * 1000
    const days: number[] = new Array(30).fill(0)
    const attempts = await db.attempts.toArray()
    const todayStart = Math.floor(now / startOfDayMs) * startOfDayMs
    attempts.forEach((a) => {
      if (!a.correct) return
      const d = Math.floor((todayStart - a.at) / startOfDayMs)
      if (d >= 0 && d < 30) days[29 - d] += 10 // +10 XP per correct
    })
    return days
  })
  const completedChapters = (chapterRows ?? []).filter((r) => (r.completedAt ?? 0) > 0).length
  const [editing, setEditing] = useState(false)
  const [nick, setNick] = useState('')

  const saveNick = async () => {
    if (!profile) return
    const v = nick.trim() || 'Genie'
    await db.profile.put({ ...profile, nickname: v })
    setEditing(false)
  }

  const badges = [
    { key: 'first', label: 'Premier pas', emoji: '🌱', desc: '1 question repondue', unlocked: (stats?.total ?? 0) >= 1 },
    { key: 'ten', label: 'Apprenti', emoji: '🔟', desc: '10 questions repondues', unlocked: (stats?.total ?? 0) >= 10 },
    { key: 'fifty', label: 'Erudit', emoji: '🎯', desc: '50 questions repondues', unlocked: (stats?.total ?? 0) >= 50 },
    { key: 'streak3', label: 'Regulier', emoji: '🔥', desc: '3 jours de serie', unlocked: (profile?.streak ?? 0) >= 3 },
    { key: 'streak7', label: 'Assidu', emoji: '💎', desc: '7 jours de serie', unlocked: (profile?.streak ?? 0) >= 7 },
    { key: 'perfect', label: 'Virtuose', emoji: '🏆', desc: '90% reussite sur 10+ Q', unlocked: (stats?.accuracy ?? 0) >= 90 && (stats?.total ?? 0) >= 10 },
    { key: 'ch1', label: 'Chapitre 1', emoji: '📖', desc: 'Fondamentaux termines', unlocked: (chapterRows ?? []).some((r) => r.chapterId === 'ch-1' && (r.completedAt ?? 0) > 0) },
    { key: 'ch7', label: 'Parcours complet', emoji: '👑', desc: 'Les 7 chapitres termines', unlocked: completedChapters >= CHAPTERS.length },
  ]

  const unlockedBadges = badges.filter((b) => b.unlocked)

  const shareBadge = (b: (typeof badges)[number]) => {
    const title = `J'ai debloque le badge "${b.label}" ${b.emoji} sur Genius !`
    const summary = `${b.desc} · Genius PWA de culture generale.`
    shareToLinkedIn(title, summary)
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-6 safe-t">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-elephant-400 to-elephant-700 flex items-center justify-center font-display text-3xl italic shadow-pop">
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
                className="flex-1 bg-surface border border-line rounded-xl px-3 py-2 outline-none focus:border-elephant-400 text-lg font-bold"
              />
              <button onClick={saveNick} className="p-2 bg-elephant-500 rounded-xl">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl truncate">{profile?.nickname}</h1>
              <button onClick={() => { setNick(profile?.nickname ?? ''); setEditing(true) }} className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-white/50 text-sm">Apprenti du savoir · {completedChapters} / {CHAPTERS.length} chapitres</p>
        </div>
      </div>

      {/* Stats grid */}
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
          <Trophy className="w-5 h-5 text-elephant-300 mb-2" />
          <div className="font-display text-3xl">{stats?.accuracy ?? 0}<span className="text-sm text-white/50">%</span></div>
          <div className="text-xs text-white/50 mt-1">Reussite ({stats?.total ?? 0} Q)</div>
        </div>
      </div>

      {/* Sparkline XP 30j */}
      {last30 && last30.some((v) => v > 0) && (
        <div className="mb-8 bg-surface border border-line rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-elephant-300" />
              <span className="text-sm font-semibold">XP · 30 derniers jours</span>
            </div>
            <span className="font-display text-xl text-elephant-300">
              {last30.reduce((s, v) => s + v, 0)}
            </span>
          </div>
          <div className="text-elephant-300">
            <Sparkline values={last30} />
          </div>
          <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-white/40 mt-1">
            <span>-30j</span>
            <span>aujourd'hui</span>
          </div>
        </div>
      )}

      {/* Settings link */}
      <Link to="/settings" className="flex items-center gap-3 mb-6 p-4 bg-surface border border-line hover:border-white/20 rounded-2xl transition">
        <SettingsIcon className="w-4 h-4 text-elephant-300" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Reglages</div>
          <div className="text-xs text-white/50">Son, vibrations, theme</div>
        </div>
        <span className="text-white/40">→</span>
      </Link>

      {/* LinkedIn share · all unlocked */}
      {unlockedBadges.length > 0 && (
        <div className="mb-8 bg-elephant-900/40 border border-elephant-700/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Linkedin className="w-4 h-4 text-elephant-300" />
            <div className="font-semibold text-sm">Partage ton profil</div>
          </div>
          <p className="text-xs text-white/60 mb-3">
            Montre tes {unlockedBadges.length} badges debloque{unlockedBadges.length > 1 ? 's' : ''} sur LinkedIn.
          </p>
          <button
            onClick={() => {
              const title = `${unlockedBadges.length} badges debloques sur Genius`
              const summary = `${profile?.xp ?? 0} XP · ${completedChapters}/${CHAPTERS.length} chapitres · ${stats?.accuracy ?? 0}% reussite · badges : ${unlockedBadges.map((b) => b.label).join(', ')}.`
              shareToLinkedIn(title, summary)
            }}
            className="btn-chunky w-full text-sm"
            data-variant="elephant"
          >
            <span className="inline-flex items-center gap-2">
              <Linkedin className="w-4 h-4" /> Partager sur LinkedIn
            </span>
          </button>
        </div>
      )}

      {/* Badges */}
      <h2 className="font-display text-2xl mb-4">Badges</h2>
      <div className="grid grid-cols-2 gap-3">
        {badges.map((b) => (
          <div
            key={b.key}
            className={`relative rounded-2xl p-3 border transition ${
              b.unlocked ? 'bg-surface border-elephant-400/40' : 'bg-surface/50 border-line opacity-40'
            }`}
          >
            <div className="text-3xl mb-1">{b.emoji}</div>
            <div className="text-xs font-bold">{b.label}</div>
            <div className="text-[10px] text-white/50 mt-0.5 leading-tight">{b.desc}</div>
            {b.unlocked && (
              <button
                onClick={() => shareBadge(b)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-elephant-500/10 hover:bg-elephant-500/20 text-elephant-300 transition"
                title="Partager sur LinkedIn"
              >
                <Share2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-line">
        <button
          onClick={async () => {
            if (confirm('Reinitialiser tes stats et cartes perso ?')) {
              await db.attempts.clear()
              await db.flashcards.where('source').equals('user').delete()
              await db.chapterProgress.clear()
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
