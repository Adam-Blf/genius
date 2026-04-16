import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Map, BookOpen, Plus, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { HomePage } from './pages/Home'
import { LearnPage } from './pages/Learn'
import { AddCardPage } from './pages/AddCard'
import { ProfilePage } from './pages/Profile'
import { ChapterPage } from './pages/Chapter'
import { CoursePage } from './pages/Course'
import { PremiumPage } from './pages/Premium'
import { PremiumSuccessPage } from './pages/PremiumSuccess'
import { SettingsPage } from './pages/Settings'
import { DailyPage } from './pages/Daily'
import { LoginPage } from './pages/Login'
import { CommunityPage } from './pages/Community'
import { InstallBanner } from './components/InstallBanner'
import { OfflineBanner } from './components/OfflineBanner'
import { AuthProvider } from './contexts/AuthContext'
import { seedIfEmpty, forceReseed } from './seed'
import { seedGeneratedInBackground } from './lib/generated'
import { regenHeartsIfNeeded } from './db'

const SEED_VERSION = '2026-04-15-v2'

function BottomNav() {
  const location = useLocation()
  const items = [
    { to: '/', icon: Map, label: 'Parcours' },
    { to: '/learn', icon: BookOpen, label: 'Libre' },
    { to: '/add', icon: Plus, label: 'Creer' },
    { to: '/profile', icon: User, label: 'Profil' },
  ]
  const hidden = location.pathname.startsWith('/learn/')
  if (hidden) return null
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-ink/90 backdrop-blur border-t border-line safe-b">
      <ul className="max-w-lg mx-auto grid grid-cols-4">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-3 text-xs transition ${
                  isActive ? 'text-elephant-300' : 'text-white/50 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <it.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className="font-semibold">{it.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const location = useLocation()

  useEffect(() => {
    ;(async () => {
      const v = localStorage.getItem('genius-seed-version')
      if (v !== SEED_VERSION) {
        await forceReseed()
        localStorage.setItem('genius-seed-version', SEED_VERSION)
      } else {
        await seedIfEmpty()
      }
      await regenHeartsIfNeeded()
      setReady(true)
      // Seed en background (requestIdleCallback) · ne bloque pas l'UI.
      // Chaque chapitre est de toute façon seedé à la demande via ensureChapterSeeded.
      seedGeneratedInBackground()
    })()
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🐘</span>
          <div className="font-display text-5xl italic text-elephant-300 animate-pulse">genius.</div>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
    <div className="min-h-screen pb-20">
      <OfflineBanner />
      <InstallBanner />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/chapter/:id" element={<ChapterPage />} />
            <Route path="/chapter/:id/course" element={<CoursePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/learn/chapter/:chapterId" element={<LearnPage />} />
            <Route path="/learn/:scope" element={<LearnPage />} />
            <Route path="/add" element={<AddCardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/daily" element={<DailyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/premium" element={<PremiumPage />} />
            <Route path="/premium/success" element={<PremiumSuccessPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </div>
    </AuthProvider>
  )
}
