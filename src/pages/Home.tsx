import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Play, Sparkles, FileText, GraduationCap, Crown, TrendingUp, Brain, Quote, BookOpen, Loader2, Zap, Target, Trophy, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { RalphMascot } from '../components/ralph/RalphMascot'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from '../components/transitions/PageTransition'
import { DailyGoalWidget } from '../components/widgets/DailyGoalWidget'
import { StatCard, StatGrid } from '../components/widgets/StatCard'
import { fetchRandomQuote, getWordOfTheDay, type Quote as QuoteType, type WordDefinition } from '../services/apis'
import { useUserData } from '../contexts/UserDataContext'

export function HomePage() {
  const navigate = useNavigate()
  const { profile: userProfile } = useUserData()

  // Use user profile data with fallbacks
  const profile = {
    display_name: userProfile.nickname || localStorage.getItem('genius_display_name') || 'Genie',
    xp_total: 0,
    current_streak: 0
  }
  const [quote, setQuote] = useState<QuoteType | null>(null)
  const [wordOfDay, setWordOfDay] = useState<WordDefinition | null>(null)
  const [loadingQuote, setLoadingQuote] = useState(true)
  const [loadingWord, setLoadingWord] = useState(true)

  // Fetch quote and word of the day
  useEffect(() => {
    const loadDailyContent = async () => {
      // Check localStorage for cached data (refresh once per day)
      const today = new Date().toDateString()
      const cachedQuote = localStorage.getItem('genius_daily_quote')
      const cachedWord = localStorage.getItem('genius_daily_word')
      const cachedDate = localStorage.getItem('genius_daily_date')

      if (cachedDate === today && cachedQuote) {
        try {
          setQuote(JSON.parse(cachedQuote))
          setLoadingQuote(false)
        } catch { /* ignore */ }
      } else {
        try {
          const q = await fetchRandomQuote()
          setQuote(q)
          localStorage.setItem('genius_daily_quote', JSON.stringify(q))
          localStorage.setItem('genius_daily_date', today)
        } catch (e) {
          console.error('Error fetching quote:', e)
        }
        setLoadingQuote(false)
      }

      if (cachedDate === today && cachedWord) {
        try {
          setWordOfDay(JSON.parse(cachedWord))
          setLoadingWord(false)
        } catch { /* ignore */ }
      } else {
        try {
          const w = await getWordOfTheDay()
          setWordOfDay(w)
          if (w) {
            localStorage.setItem('genius_daily_word', JSON.stringify(w))
          }
        } catch (e) {
          console.error('Error fetching word:', e)
        }
        setLoadingWord(false)
      }
    }

    loadDailyContent()
  }, [])

  const dailyGoal = {
    current: profile?.xp_total ? Math.min(profile.xp_total % 50, 50) : 0,
    target: 50
  }

  // Feature cards for the new learning sections
  const features = [
    {
      id: 'funfacts',
      title: 'Fun Facts',
      description: 'Decouvre +10,000 faits incroyables',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
      path: '/funfacts'
    },
    {
      id: 'trivia',
      title: 'Trivia Quiz',
      description: 'Teste tes connaissances',
      icon: Brain,
      color: 'from-indigo-500 to-violet-600',
      path: '/trivia'
    },
    {
      id: 'notes',
      title: 'Revision IA',
      description: 'Transforme tes cours en flashcards',
      icon: FileText,
      color: 'from-blue-500 to-cyan-600',
      path: '/notes'
    },
    {
      id: 'flashcards',
      title: 'Flashcards',
      description: 'Revise et memorise efficacement',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-600',
      path: '/flashcards'
    }
  ]

  return (
    <div className="min-h-screen bg-genius-bg pb-20 pt-16">
      <TopBar />

      <div className="p-4 max-w-lg mx-auto">
        {/* Welcome section with Ralph - Enhanced */}
        <FadeIn delay={0.1}>
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              animate={{
                y: [0, -5, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <RalphMascot mood="happy" size="sm" />
            </motion.div>
            <div>
              <motion.h1
                className="text-xl font-bold text-white"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Salut {profile?.display_name || 'Genie'} !
              </motion.h1>
              <motion.p
                className="text-gray-400 text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Pret a apprendre aujourd'hui ?
              </motion.p>
            </div>
            {/* XP Badge with glow effect */}
            <motion.div
              className="ml-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-genius-cyan/30 blur-lg rounded-full" />
                <Badge variant="xp" size="md" className="relative">
                  <Zap className="w-3 h-3 mr-1" />
                  {profile?.xp_total || 0} XP
                </Badge>
              </div>
            </motion.div>
          </div>
        </FadeIn>

        {/* Daily goal card - Using DailyGoalWidget */}
        <SlideUp delay={0.2}>
          <Card variant="glass" padding="lg" className="mb-6 overflow-hidden relative">
            {/* Decorative gradient orb */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-genius-cyan/20 rounded-full blur-2xl" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-genius-cyan" />
                  <span className="text-sm font-medium text-gray-300">Objectif du jour</span>
                </div>
                <Badge variant="xp" size="sm" className="bg-genius-cyan/20 text-genius-cyan border-genius-cyan/30">
                  {dailyGoal.current}/{dailyGoal.target} XP
                </Badge>
              </div>

              {/* Enhanced progress bar */}
              <div className="relative mb-4">
                <div className="w-full bg-gray-800/80 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(90deg, #0052D4, #4364F7, #6FB1FC, #00E5FF)'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(dailyGoal.current / dailyGoal.target) * 100}%` }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    />
                  </motion.div>
                </div>
                {/* Progress markers */}
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">0</span>
                  <span className="text-xs text-gray-500">{dailyGoal.target} XP</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/learn')}
                variant="primary"
                size="lg"
                className="w-full group relative overflow-hidden"
                leftIcon={<Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />}
              >
                <span className="relative z-10">Commencer une lecon</span>
                {/* Button hover glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-genius-cyan/0 via-genius-cyan/20 to-genius-cyan/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
            </div>
          </Card>
        </SlideUp>

        {/* Stats cards - Enhanced with animations */}
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 gap-3 mb-6">
          <StaggerItem>
            <Card
              variant="default"
              padding="md"
              interactive
              onClick={() => navigate('/leaderboard')}
              className="group relative overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 relative">
                <motion.div
                  className="p-2.5 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl border border-orange-500/20"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </motion.div>
                <div>
                  <motion.p
                    className="text-2xl font-bold text-white"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {profile?.current_streak || 0}
                  </motion.p>
                  <p className="text-xs text-gray-500">Jours de serie</p>
                </div>
                {profile?.current_streak && profile.current_streak >= 7 && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <span className="text-lg">🔥</span>
                  </motion.div>
                )}
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card
              variant="default"
              padding="md"
              interactive
              onClick={() => navigate('/leaderboard')}
              className="group relative overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 relative">
                <motion.div
                  className="p-2.5 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl border border-primary-500/20"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Crown className="w-6 h-6 text-primary-400" />
                </motion.div>
                <div>
                  <p className="text-2xl font-bold text-white">Bronze</p>
                  <p className="text-xs text-gray-500">Ligue actuelle</p>
                </div>
              </div>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* New Learning Features - Enhanced */}
        <SlideUp delay={0.3}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-primary-500 to-genius-cyan rounded-full" />
              Apprendre
            </h2>
            <Trophy className="w-5 h-5 text-gray-500" />
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.08 }}
              >
                <Card
                  variant="default"
                  padding="none"
                  interactive
                  onClick={() => navigate(feature.path)}
                  className="group overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4 relative">
                    {/* Hover background effect */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    />

                    <motion.div
                      className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} relative overflow-hidden`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Icon shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <feature.icon className="w-6 h-6 text-white relative z-10" />
                    </motion.div>

                    <div className="flex-1 min-w-0 relative z-10">
                      <h3 className="font-semibold text-white group-hover:text-genius-cyan transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">{feature.description}</p>
                    </div>

                    <motion.div
                      className="text-gray-500"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                    >
                      <ChevronRight className="w-5 h-5 group-hover:text-genius-cyan transition-colors" />
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </SlideUp>

        {/* Quote of the Day - Enhanced */}
        <ScaleIn delay={0.5}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Quote className="w-5 h-5 text-amber-400" />
              </motion.div>
              <h2 className="text-lg font-semibold text-white">Citation du jour</h2>
            </div>

            <Card variant="glass" padding="lg" className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 relative overflow-hidden">
              {/* Decorative quote marks */}
              <div className="absolute -top-2 -left-2 text-6xl text-amber-500/10 font-serif">"</div>
              <div className="absolute -bottom-4 -right-2 text-6xl text-amber-500/10 font-serif rotate-180">"</div>

              <AnimatePresence mode="wait">
                {loadingQuote ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center py-4"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-6 h-6 text-amber-400" />
                    </motion.div>
                  </motion.div>
                ) : quote ? (
                  <motion.div
                    key="quote"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10"
                  >
                    <p className="text-white italic leading-relaxed mb-3 text-lg">"{quote.content}"</p>
                    <p className="text-amber-400 text-sm font-medium text-right">- {quote.author}</p>
                  </motion.div>
                ) : (
                  <p className="text-gray-400 text-center relative z-10">Citation non disponible</p>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </ScaleIn>

        {/* Word of the Day - Enhanced */}
        <ScaleIn delay={0.6}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen className="w-5 h-5 text-genius-cyan" />
              </motion.div>
              <h2 className="text-lg font-semibold text-white">Mot du jour</h2>
            </div>

            <Card variant="glass" padding="lg" className="bg-gradient-to-br from-genius-cyan/10 to-primary-500/10 border border-genius-cyan/20 relative overflow-hidden">
              {/* Decorative gradient orb */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-genius-cyan/20 rounded-full blur-2xl" />

              <AnimatePresence mode="wait">
                {loadingWord ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center py-4"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-6 h-6 text-genius-cyan" />
                    </motion.div>
                  </motion.div>
                ) : wordOfDay ? (
                  <motion.div
                    key="word"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10"
                  >
                    <div className="flex items-baseline gap-3 mb-3">
                      <motion.h3
                        className="text-2xl font-bold text-white capitalize"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        {wordOfDay.word}
                      </motion.h3>
                      {wordOfDay.phonetic && (
                        <motion.span
                          className="text-genius-cyan text-sm font-mono"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {wordOfDay.phonetic}
                        </motion.span>
                      )}
                    </div>
                    {wordOfDay.meanings[0] && (
                      <div>
                        <motion.span
                          className="text-xs font-medium px-2.5 py-1 rounded-full bg-genius-cyan/20 text-genius-cyan mb-3 inline-block border border-genius-cyan/30"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1, type: "spring" }}
                        >
                          {wordOfDay.meanings[0].partOfSpeech}
                        </motion.span>
                        <motion.p
                          className="text-gray-300 text-sm leading-relaxed mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {wordOfDay.meanings[0].definitions[0]?.definition}
                        </motion.p>
                        {wordOfDay.meanings[0].definitions[0]?.example && (
                          <motion.p
                            className="text-gray-500 text-xs mt-3 italic bg-gray-800/50 p-2 rounded-lg border-l-2 border-genius-cyan/50"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            Ex: "{wordOfDay.meanings[0].definitions[0].example}"
                          </motion.p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <p className="text-gray-400 text-center relative z-10">Mot non disponible</p>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </ScaleIn>

        {/* Categories preview - Enhanced */}
        <SlideUp delay={0.7}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-genius-cyan to-primary-500 rounded-full" />
              Categories
            </h2>
            <motion.button
              onClick={() => navigate('/learn')}
              className="text-sm text-primary-400 hover:text-genius-cyan transition-colors flex items-center gap-1"
              whileHover={{ x: 3 }}
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Histoire', emoji: '📜', color: 'from-amber-500 to-orange-600' },
              { name: 'Sciences', emoji: '🔬', color: 'from-green-500 to-emerald-600' },
              { name: 'Geo', emoji: '🌍', color: 'from-blue-500 to-cyan-600' },
              { name: 'Arts', emoji: '🎨', color: 'from-purple-500 to-pink-600' },
              { name: 'Sports', emoji: '⚽', color: 'from-red-500 to-rose-600' },
              { name: 'Divers', emoji: '🎬', color: 'from-indigo-500 to-violet-600' }
            ].map((cat, i) => (
              <motion.button
                key={cat.name}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.05, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/learn')}
                className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white text-center relative overflow-hidden group shadow-lg`}
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />

                {/* Shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                />

                <motion.span
                  className="text-2xl block mb-1 relative z-10"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  {cat.emoji}
                </motion.span>
                <span className="text-xs font-medium relative z-10">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </SlideUp>

        {/* Bottom spacer for better scroll */}
        <div className="h-4" />
      </div>

      <BottomNav />
    </div>
  )
}
