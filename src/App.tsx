import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Home, BookOpen, Plus, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { HomePage } from './pages/Home'
import { LearnPage } from './pages/Learn'
import { AddCardPage } from './pages/AddCard'
import { ProfilePage } from './pages/Profile'
import { CategoryPage } from './pages/Category'
import { seedIfEmpty } from './seed'
import { regenHeartsIfNeeded } from './db'

function BottomNav() {
  const location = useLocation()
  const items = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/learn', icon: BookOpen, label: 'Apprendre' },
    { to: '/add', icon: Plus, label: 'Creer' },
    { to: '/profile', icon: User, label: 'Profil' },
  ]
  const hidden = location.pathname.startsWith('/learn/') || location.pathname.startsWith('/category/')
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
                  isActive ? 'text-grass' : 'text-white/50 hover:text-white'
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
      await seedIfEmpty()
      await regenHeartsIfNeeded()
      setReady(true)
    })()
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="font-display text-5xl italic text-grass animate-pulse">genius.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
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
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/learn/:scope" element={<LearnPage />} />
            <Route path="/category/:cat" element={<CategoryPage />} />
            <Route path="/add" element={<AddCardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </div>
  )
}
