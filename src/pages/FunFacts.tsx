import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, RefreshCw, Sparkles, X, Loader2, Zap, Trophy, RotateCcw } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { Button } from '../components/ui/Button'
import { GeniusCard, type GeniusCardRef } from '../components/GeniusCard'
import { FABControls } from '../components/FABControls'
import { fetchMultipleFacts, type FunFact } from '../services/apis'
import { useSavedFacts, useUserStats } from '../hooks/useDatabase'
import { facts as localFacts, categories, type Fact } from '../data/facts'

// Convert API FunFact to local Fact format
function convertToLocalFact(fact: FunFact, index: number): Fact {
  const categoryMap: Record<string, string> = {
    science: 'science',
    history: 'histoire',
    nature: 'nature',
    geography: 'geo',
    general: 'insolite'
  }

  const emojiMap: Record<string, string> = {
    science: '\\ud83d\\udd2c',
    history: '\\ud83d\\udcdc',
    nature: '\\ud83c\\udf3f',
    geography: '\\ud83c\\udf0d',
    general: '\\ud83e\\udd2f'
  }

  const category = categoryMap[fact.category || 'general'] || 'insolite'

  return {
    id: parseInt(fact.id) || index + 1000,
    category,
    title: fact.category || 'Fun Fact',
    content: fact.fact,
    emoji: emojiMap[fact.category || 'general'] || '\\ud83d\\udca1'
  }
}

export function FunFactsPage() {
  const [facts, setFacts] = useState<Fact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const [combo, setCombo] = useState(0)
  const [showCombo, setShowCombo] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef<GeniusCardRef | null>(null)

  // Use Dexie.js hooks for persistent storage
  const { facts: savedFacts, saveFact, deleteFact, isLoading: factsLoading } = useSavedFacts()
  const { stats, addXP, incrementCards } = useUserStats()

  // Fetch facts from API or use local
  const fetchFacts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const apiFacts = await fetchMultipleFacts(15)

      if (apiFacts.every(f => f.source === 'local')) {
        const shuffled = [...localFacts].sort(() => Math.random() - 0.5).slice(0, 15)
        setFacts(shuffled)
        setError('Mode hors-ligne active')
      } else {
        const converted = apiFacts.map((f, i) => convertToLocalFact(f, i))
        setFacts(converted)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      const shuffled = [...localFacts].sort(() => Math.random() - 0.5).slice(0, 15)
      setFacts(shuffled)
      setError('Mode hors-ligne active')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFacts()
  }, [fetchFacts])

  // Handle swipe action
  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    const currentFact = facts[0]
    if (!currentFact) return

    setFacts(prev => prev.slice(1))
    setIsFlipped(false)

    await incrementCards()

    if (direction === 'right') {
      await saveFact({
        factId: String(currentFact.id),
        title: currentFact.title,
        content: currentFact.content,
        emoji: currentFact.emoji,
        category: currentFact.category
      })

      await addXP(10)

      setCombo(prev => prev + 1)
      setShowCombo(true)
      setTimeout(() => setShowCombo(false), 1500)
    } else {
      setCombo(0)
    }

    await addXP(2)

    if (facts.length <= 4) {
      fetchFacts()
    }
  }, [facts, saveFact, addXP, incrementCards, fetchFacts])

  const handleSwipeLeft = () => handleSwipe('left')
  const handleSwipeRight = () => handleSwipe('right')
  const handleFlip = () => {
    cardRef.current?.flip()
    setIsFlipped(!isFlipped)
  }

  const handleRemoveSaved = useCallback(async (id: number) => {
    await deleteFact(id)
  }, [deleteFact])

  const resetProgress = () => {
    if (confirm('Reinitialiser toute la progression ?')) {
      fetchFacts()
    }
  }

  const currentFact = facts[0]
  const category = currentFact ? categories[currentFact.category] || categories.insolite : null

  return (
    <div className="min-h-screen bg-genius-bg pb-40 pt-16">
      <TopBar />

      <div className="p-4 max-w-lg mx-auto">
        {/* Header with gradient */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <motion.img
              src="/ralph.png"
              alt="Ralph"
              className="w-14 h-14 object-contain drop-shadow-lg"
              animate={{
                y: [0, -5, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div>
              <h1 className="text-xl font-bold text-gradient-blue flex items-center gap-2">
                Fun Facts
                {stats && stats.currentStreak > 0 && (
                  <span className="flex items-center gap-1 text-sm bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                    <Zap size={12} />
                    {stats.currentStreak}
                  </span>
                )}
              </h1>
              <p className="text-gray-400 text-sm">Decouvre le monde</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaved(true)}
              className="relative flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-700/50 hover:border-[#00E5FF]/50 transition-colors"
            >
              <Bookmark size={18} className="text-[#00E5FF]" />
              <span className="text-sm font-medium text-white">{savedFacts.length}</span>
            </button>
            <button
              onClick={resetProgress}
              className="p-2 bg-slate-800/80 backdrop-blur-sm rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700/50"
              title="Recharger"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </motion.div>

        {/* XP and Stats Bar with Blue accent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 text-sm mb-6 p-3 bg-slate-900/50 rounded-2xl border border-[#4364F7]/20"
        >
          <div className="flex items-center gap-2 text-[#00E5FF]">
            <Sparkles size={16} />
            <span>{stats?.totalCards || 0} cartes vues</span>
          </div>
          <div className="flex items-center gap-2 text-[#6FB1FC]">
            <Trophy size={16} />
            <span>{stats?.totalXP || 0} XP</span>
          </div>
          {error && (
            <span className="text-orange-400 text-xs ml-auto">{error}</span>
          )}
        </motion.div>

        {/* Combo indicator */}
        <AnimatePresence>
          {showCombo && combo > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.5, y: -30 }}
              className="absolute top-32 left-1/2 -translate-x-1/2 z-50"
            >
              <div
                className="text-white font-bold text-2xl px-6 py-3 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
                  boxShadow: '0 0 30px rgba(0, 229, 255, 0.3)'
                }}
              >
                {combo}x COMBO!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Area */}
        <div className="relative w-full flex items-center justify-center" style={{ height: '420px' }}>
          {loading && facts.length === 0 ? (
            <div className="flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-12 h-12 text-[#4364F7]" />
              </motion.div>
              <p className="text-gray-400 mt-4">Chargement des faits...</p>
            </div>
          ) : currentFact ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFact.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full"
              >
                <GeniusCard
                  ref={cardRef}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onFlip={(flipped) => setIsFlipped(flipped)}
                  frontContent={
                    <div className="h-full flex flex-col">
                      {/* Category badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-3xl">{currentFact.emoji}</span>
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 100%)',
                            color: 'white'
                          }}
                        >
                          {category?.name || 'Fun Fact'}
                        </span>
                      </div>

                      {/* Question indicator */}
                      <div className="text-[#0052D4] font-bold text-sm uppercase tracking-wider mb-2">
                        Le Saviez-Vous ?
                      </div>

                      {/* Fact content */}
                      <div className="flex-1 flex items-center">
                        <p className="text-slate-800 text-lg leading-relaxed font-medium">
                          {currentFact.content}
                        </p>
                      </div>

                      {/* Bottom hint */}
                      <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mt-4">
                        <RotateCcw size={14} />
                        <span>Tap pour voir l'explication</span>
                      </div>
                    </div>
                  }
                  backContent={
                    <div className="h-full flex flex-col bg-gradient-to-br from-[#0052D4]/5 to-[#6FB1FC]/10 -m-6 p-6 rounded-card">
                      {/* Back header */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-3xl">{currentFact.emoji}</span>
                        <span className="text-[#0052D4] font-bold text-lg">
                          Explication
                        </span>
                      </div>

                      {/* Explanation content */}
                      <div className="flex-1 flex items-center">
                        <div className="space-y-4">
                          <p className="text-slate-700 leading-relaxed">
                            Ce fait fascinant illustre la richesse de notre monde.
                            Chaque jour apporte son lot de decouvertes et de merveilles.
                          </p>
                          <div className="p-4 bg-white/50 rounded-xl border border-[#4364F7]/20">
                            <p className="text-slate-600 text-sm italic">
                              "{currentFact.content}"
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Source */}
                      <div className="text-center text-slate-400 text-xs mt-4">
                        Source: {category?.name || 'Culture Generale'}
                      </div>
                    </div>
                  }
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center px-4"
            >
              <motion.img
                src="/ralph.png"
                alt="Ralph"
                className="w-32 h-32 object-contain mb-4"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <h2 className="text-2xl font-bold text-gradient-blue mb-2">Bravo !</h2>
              <p className="text-slate-400 mb-6">Tu as explore tous les faits disponibles !</p>
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

        {/* Remaining cards indicator */}
        {facts.length > 0 && (
          <div className="text-center text-slate-500 text-sm mt-2">
            {facts.length} carte{facts.length > 1 ? 's' : ''} restante{facts.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* FAB Controls - Fixed at bottom */}
      {facts.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-40 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/95 to-transparent pt-8 pb-4">
          <FABControls
            onSwipeLeft={handleSwipeLeft}
            onFlip={handleFlip}
            onSwipeRight={handleSwipeRight}
            variant="sparkles"
          />
        </div>
      )}

      {/* Saved Facts Modal */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowSaved(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-h-[85vh] bg-slate-900 rounded-t-3xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Bookmark className="text-[#00E5FF]" />
                    Mes favoris
                    <span className="text-sm font-normal text-slate-400">
                      ({savedFacts.length})
                    </span>
                  </h2>
                  <button
                    onClick={() => setShowSaved(false)}
                    className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[65vh] space-y-3 pb-8">
                  {factsLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 text-[#4364F7] animate-spin mx-auto" />
                    </div>
                  ) : savedFacts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg">Aucun fait sauvegarde</p>
                      <p className="text-sm mt-2">Swipe vers la droite pour sauvegarder tes favoris</p>
                    </div>
                  ) : (
                    savedFacts.map((fact, index) => {
                      const factCategory = categories[fact.category] || categories.insolite

                      return (
                        <motion.div
                          key={fact.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 100 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-0.5 rounded-2xl"
                          style={{
                            background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)'
                          }}
                        >
                          <div className="bg-slate-900 rounded-[14px] p-4 relative group">
                            <button
                              onClick={() => handleRemoveSaved(fact.id!)}
                              className="absolute top-3 right-3 p-1.5 bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                            >
                              <X size={14} className="text-white" />
                            </button>

                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{fact.emoji}</span>
                              <span className="text-xs font-medium text-[#6FB1FC]">
                                {factCategory.name}
                              </span>
                            </div>

                            <h3 className="font-semibold text-white mb-1">{fact.title}</h3>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {fact.content}
                            </p>

                            <div className="mt-2 text-xs text-slate-500">
                              Sauvegarde le {fact.savedAt ? new Date(fact.savedAt).toLocaleDateString('fr-FR') : 'N/A'}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
