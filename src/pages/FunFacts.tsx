import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { Bookmark, RefreshCw, Sparkles, X, Loader2 } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { Button } from '../components/ui/Button'
import { fetchMultipleFacts, type FunFact } from '../services/apis'

// Local storage keys
const SAVED_FACTS_KEY = 'genius_saved_funfacts'
const SEEN_FACTS_KEY = 'genius_seen_funfacts'

// Single Swipeable Card Component
function SwipeableCard({
  fact,
  onSwipe,
  isTop
}: {
  fact: FunFact
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  // Indicators
  const saveOpacity = useTransform(x, [0, 100], [0, 1])
  const skipOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      onSwipe('left')
    }
  }

  const categoryColors: Record<string, string> = {
    science: 'from-blue-500 to-cyan-500',
    history: 'from-amber-500 to-orange-500',
    nature: 'from-green-500 to-emerald-500',
    geography: 'from-purple-500 to-pink-500',
    general: 'from-indigo-500 to-violet-500'
  }

  const color = categoryColors[fact.category || 'general'] || categoryColors.general

  return (
    <motion.div
      className="absolute w-full cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
    >
      {/* Save Indicator */}
      {isTop && (
        <motion.div
          style={{ opacity: saveOpacity }}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10"
        >
          <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
            <Bookmark className="w-5 h-5" />
            SAVE
          </div>
        </motion.div>
      )}

      {/* Skip Indicator */}
      {isTop && (
        <motion.div
          style={{ opacity: skipOpacity }}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10"
        >
          <div className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
            <X className="w-5 h-5" />
            SKIP
          </div>
        </motion.div>
      )}

      {/* Card Content */}
      <div className={`bg-gradient-to-br ${color} rounded-3xl p-6 min-h-[380px] flex flex-col shadow-2xl`}>
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
            {fact.category || 'Fun Fact'}
          </span>
          <Sparkles className="w-5 h-5 text-white/70" />
        </div>

        {/* Fact Content */}
        <div className="flex-1 flex items-center">
          <p className="text-white text-xl font-medium leading-relaxed">
            {fact.fact}
          </p>
        </div>

        {/* Bottom hint */}
        <div className="flex items-center justify-center gap-8 mt-4 text-white/60 text-sm">
          <span className="flex items-center gap-1">
            <X className="w-4 h-4" /> Skip
          </span>
          <span className="flex items-center gap-1">
            <Bookmark className="w-4 h-4" /> Save
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function FunFactsPage() {
  const [facts, setFacts] = useState<FunFact[]>([])
  const [savedFacts, setSavedFacts] = useState<FunFact[]>([])
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [showSaved, setShowSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ seen: 0, saved: 0 })

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(SAVED_FACTS_KEY)
    const seenData = localStorage.getItem(SEEN_FACTS_KEY)

    if (savedData) {
      try {
        setSavedFacts(JSON.parse(savedData))
      } catch (e) {
        console.error('Failed to parse saved facts')
      }
    }

    if (seenData) {
      try {
        setSeenIds(new Set(JSON.parse(seenData)))
      } catch (e) {
        console.error('Failed to parse seen facts')
      }
    }
  }, [])

  // Fetch facts from multiple APIs
  const fetchFacts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const newFacts = await fetchMultipleFacts(10)
      setFacts(newFacts)

      // Check if using fallback
      if (newFacts.every(f => f.source === 'local')) {
        setError('Mode hors-ligne. Connecte-toi pour plus de faits !')
      }
    } catch (err) {
      console.error('API Error:', err)
      setError('Erreur de chargement. Reessaie plus tard.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchFacts()
  }, [fetchFacts])

  // Update stats
  useEffect(() => {
    setStats({
      seen: seenIds.size,
      saved: savedFacts.length
    })
  }, [seenIds, savedFacts])

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentFact = facts[0]
    if (!currentFact) return

    // Mark as seen
    const newSeenIds = new Set(seenIds)
    newSeenIds.add(currentFact.id)
    setSeenIds(newSeenIds)
    localStorage.setItem(SEEN_FACTS_KEY, JSON.stringify([...newSeenIds]))

    // If swiped right, save the fact
    if (direction === 'right') {
      const newSaved = [...savedFacts, currentFact]
      setSavedFacts(newSaved)
      localStorage.setItem(SAVED_FACTS_KEY, JSON.stringify(newSaved))
    }

    // Remove from deck
    setFacts(prev => prev.slice(1))

    // Fetch more if running low
    if (facts.length <= 3) {
      fetchFacts()
    }
  }

  const removeSavedFact = (id: string) => {
    const newSaved = savedFacts.filter(f => f.id !== id)
    setSavedFacts(newSaved)
    localStorage.setItem(SAVED_FACTS_KEY, JSON.stringify(newSaved))
  }

  const resetProgress = () => {
    if (confirm('Reinitialiser toute la progression ?')) {
      localStorage.removeItem(SAVED_FACTS_KEY)
      localStorage.removeItem(SEEN_FACTS_KEY)
      setSavedFacts([])
      setSeenIds(new Set())
      fetchFacts()
    }
  }

  return (
    <div className="min-h-screen bg-genius-bg pb-20 pt-16">
      <TopBar />

      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <motion.img
              src="/ralph.png"
              alt="Ralph"
              className="w-12 h-12 object-contain"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div>
              <h1 className="text-xl font-bold text-white">Fun Facts</h1>
              <p className="text-gray-400 text-sm">Decouvre le monde</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaved(true)}
              className="relative flex items-center gap-1.5 bg-slate-800 px-3 py-2 rounded-xl"
            >
              <Bookmark size={18} className="text-amber-400" />
              <span className="text-sm font-medium text-white">{stats.saved}</span>
            </button>
            <button
              onClick={resetProgress}
              className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-slate-400 mb-6"
        >
          <Sparkles size={14} className="text-indigo-400" />
          <span>{stats.seen} faits decouverts</span>
          {error && (
            <span className="text-amber-400 text-xs ml-auto">{error}</span>
          )}
        </motion.div>

        {/* Swipe Area */}
        <div className="relative w-full" style={{ minHeight: '420px' }}>
          {loading && facts.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary-400 animate-spin mb-4" />
              <p className="text-gray-400">Chargement des faits...</p>
            </div>
          ) : facts.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {facts.slice(0, 3).map((fact, index) => (
                <SwipeableCard
                  key={fact.id}
                  fact={fact}
                  onSwipe={handleSwipe}
                  isTop={index === 0}
                />
              )).reverse()}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <motion.img
                src="/ralph.png"
                alt="Ralph"
                className="w-32 h-32 object-contain mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <h2 className="text-2xl font-bold text-white mb-2">Bravo !</h2>
              <p className="text-slate-400 mb-6">Tu as explore tous les faits !</p>
              <Button
                onClick={fetchFacts}
                variant="primary"
                size="lg"
                leftIcon={<RefreshCw className="w-5 h-5" />}
              >
                Charger plus de faits
              </Button>
            </motion.div>
          )}
        </div>

        {/* Bottom Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center items-center gap-8 text-slate-500 mt-6"
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-1">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-xs">Suivant</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-1">
              <Bookmark className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs">Sauvegarder</span>
          </div>
        </motion.div>
      </div>

      {/* Saved Facts Modal */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end"
            onClick={() => setShowSaved(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-h-[85vh] bg-slate-900 rounded-t-3xl p-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bookmark className="text-amber-400" />
                  Mes favoris ({savedFacts.length})
                </h2>
                <button
                  onClick={() => setShowSaved(false)}
                  className="p-2 bg-slate-800 rounded-xl"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[70vh] space-y-3 pb-8">
                {savedFacts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Aucun fait sauvegarde</p>
                    <p className="text-sm mt-1">Swipe vers la droite pour sauvegarder</p>
                  </div>
                ) : (
                  savedFacts.map(fact => (
                    <motion.div
                      key={fact.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-slate-800 rounded-2xl p-4 relative group"
                    >
                      <button
                        onClick={() => removeSavedFact(fact.id)}
                        className="absolute top-2 right-2 p-1.5 bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} className="text-white" />
                      </button>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 capitalize mb-2 inline-block">
                        {fact.category || 'Fun Fact'}
                      </span>
                      <p className="text-white text-sm leading-relaxed">{fact.fact}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
