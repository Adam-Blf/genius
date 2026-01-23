import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle, Star, Sparkles, Trophy, TrendingUp, ChevronDown, Zap } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from '../components/transitions'

interface Category {
  id: string
  name: string
  emoji: string
  color: string
  progress: number
  lessons: Lesson[]
}

interface Lesson {
  id: number
  name: string
  status: 'completed' | 'available' | 'locked'
  stars: number
}

// Genius Blue Edition gradient colors
const categoryGradients = {
  history: 'from-[#0052D4] via-[#4364F7] to-[#6FB1FC]',
  science: 'from-[#00C853] via-[#00E676] to-[#69F0AE]',
  geo: 'from-[#00E5FF] via-[#18FFFF] to-[#84FFFF]',
  arts: 'from-[#FF5252] via-[#FF7B7B] to-[#FFAB91]',
  sports: 'from-[#FF9100] via-[#FFAB40] to-[#FFD180]',
  entertainment: 'from-[#AA00FF] via-[#D500F9] to-[#EA80FC]'
}

const mockCategories: Category[] = [
  {
    id: 'history',
    name: 'Histoire',
    emoji: '📜',
    color: categoryGradients.history,
    progress: 40,
    lessons: [
      { id: 1, name: 'Antiquite', status: 'completed', stars: 3 },
      { id: 2, name: 'Moyen Age', status: 'completed', stars: 2 },
      { id: 3, name: 'Renaissance', status: 'available', stars: 0 },
      { id: 4, name: 'Revolution', status: 'locked', stars: 0 },
      { id: 5, name: 'Guerres Mondiales', status: 'locked', stars: 0 }
    ]
  },
  {
    id: 'science',
    name: 'Sciences',
    emoji: '🔬',
    color: categoryGradients.science,
    progress: 20,
    lessons: [
      { id: 1, name: 'Physique', status: 'completed', stars: 3 },
      { id: 2, name: 'Chimie', status: 'available', stars: 0 },
      { id: 3, name: 'Biologie', status: 'locked', stars: 0 },
      { id: 4, name: 'Astronomie', status: 'locked', stars: 0 }
    ]
  },
  {
    id: 'geo',
    name: 'Geographie',
    emoji: '🌍',
    color: categoryGradients.geo,
    progress: 0,
    lessons: [
      { id: 1, name: 'Capitales', status: 'available', stars: 0 },
      { id: 2, name: 'Drapeaux', status: 'locked', stars: 0 },
      { id: 3, name: 'Montagnes', status: 'locked', stars: 0 }
    ]
  },
  {
    id: 'arts',
    name: 'Arts',
    emoji: '🎨',
    color: categoryGradients.arts,
    progress: 0,
    lessons: [
      { id: 1, name: 'Peinture', status: 'available', stars: 0 },
      { id: 2, name: 'Musique', status: 'locked', stars: 0 },
      { id: 3, name: 'Cinema', status: 'locked', stars: 0 }
    ]
  },
  {
    id: 'sports',
    name: 'Sports',
    emoji: '⚽',
    color: categoryGradients.sports,
    progress: 0,
    lessons: [
      { id: 1, name: 'Football', status: 'available', stars: 0 },
      { id: 2, name: 'Tennis', status: 'locked', stars: 0 },
      { id: 3, name: 'Olympisme', status: 'locked', stars: 0 }
    ]
  },
  {
    id: 'entertainment',
    name: 'Divertissement',
    emoji: '🎬',
    color: categoryGradients.entertainment,
    progress: 0,
    lessons: [
      { id: 1, name: 'Jeux Video', status: 'available', stars: 0 },
      { id: 2, name: 'Series TV', status: 'locked', stars: 0 },
      { id: 3, name: 'Pop Culture', status: 'locked', stars: 0 }
    ]
  }
]

// Stats summary component
function StatsHeader() {
  const totalLessons = mockCategories.reduce((acc, cat) => acc + cat.lessons.length, 0)
  const completedLessons = mockCategories.reduce(
    (acc, cat) => acc + cat.lessons.filter(l => l.status === 'completed').length, 0
  )
  const totalStars = mockCategories.reduce(
    (acc, cat) => acc + cat.lessons.reduce((a, l) => a + l.stars, 0), 0
  )

  return (
    <motion.div
      className="grid grid-cols-3 gap-3 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0052D4]/20 to-[#4364F7]/20 rounded-2xl p-4 border border-[#4364F7]/30">
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-[#4364F7]/20 rounded-full blur-xl" />
        <Trophy className="w-5 h-5 text-[#6FB1FC] mb-2" />
        <p className="text-2xl font-bold text-white">{completedLessons}</p>
        <p className="text-xs text-gray-400">Lecons</p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-4 border border-amber-500/30">
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-amber-500/20 rounded-full blur-xl" />
        <Star className="w-5 h-5 text-amber-400 mb-2 fill-amber-400" />
        <p className="text-2xl font-bold text-white">{totalStars}</p>
        <p className="text-xs text-gray-400">Etoiles</p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-[#00E5FF]/20 to-[#00B8D4]/20 rounded-2xl p-4 border border-[#00E5FF]/30">
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-[#00E5FF]/20 rounded-full blur-xl" />
        <TrendingUp className="w-5 h-5 text-[#00E5FF] mb-2" />
        <p className="text-2xl font-bold text-white">{Math.round((completedLessons / totalLessons) * 100)}%</p>
        <p className="text-xs text-gray-400">Progress</p>
      </div>
    </motion.div>
  )
}

export function LearnPage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const handleLessonClick = (lesson: Lesson, categoryId: string) => {
    if (lesson.status !== 'locked') {
      navigate(`/lesson/${categoryId}/${lesson.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-genius-bg pb-20 pt-16">
      <TopBar />

      <div className="p-4 max-w-lg mx-auto">
        {/* Header with animated gradient */}
        <FadeIn delay={0}>
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              className="relative"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src="/ralph.png" alt="Ralph" className="w-14 h-14 object-contain" />
              <motion.div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-[#0052D4] to-[#6FB1FC] flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-blue">Apprendre</h1>
              <p className="text-gray-400 text-sm">Choisis une categorie pour commencer</p>
            </div>
          </div>
        </FadeIn>

        {/* Stats Header */}
        <StatsHeader />

        {/* Category cards */}
        <StaggerContainer className="space-y-4">
          {mockCategories.map((category, index) => (
            <StaggerItem key={category.id}>
              <motion.div
                whileHover={{ scale: 1.02, translateY: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card
                  variant="default"
                  padding="none"
                  className="overflow-hidden border border-slate-700/50 hover:border-[#4364F7]/50 transition-all duration-300"
                  style={{
                    boxShadow: selectedCategory?.id === category.id
                      ? '0 10px 40px -10px rgba(0, 82, 212, 0.3)'
                      : '0 4px 20px -4px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {/* Category header */}
                  <button
                    onClick={() => setSelectedCategory(
                      selectedCategory?.id === category.id ? null : category
                    )}
                    className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
                  >
                    <motion.div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl relative overflow-hidden`}
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      {category.emoji}
                    </motion.div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{category.name}</h3>
                        {category.progress > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs px-2 py-0.5 rounded-full bg-[#4364F7]/20 text-[#6FB1FC]"
                          >
                            En cours
                          </motion.span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${category.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${category.progress}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 min-w-[32px]">{category.progress}%</span>
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: selectedCategory?.id === category.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-400"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </button>

                  {/* Lessons list */}
                  <AnimatePresence>
                    {selectedCategory?.id === category.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-slate-700/50"
                      >
                        <div className="p-3 space-y-2 bg-slate-800/30">
                          {category.lessons.map((lesson, lessonIndex) => (
                            <motion.button
                              key={lesson.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: lessonIndex * 0.05 }}
                              onClick={() => handleLessonClick(lesson, category.id)}
                              disabled={lesson.status === 'locked'}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                                lesson.status === 'locked'
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'hover:bg-white/10 active:scale-[0.98]'
                              }`}
                              whileHover={lesson.status !== 'locked' ? { x: 4 } : {}}
                            >
                              {/* Status icon with glow */}
                              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                                lesson.status === 'completed'
                                  ? 'bg-gradient-to-br from-[#00C853] to-[#69F0AE]'
                                  : lesson.status === 'available'
                                  ? 'bg-gradient-to-br from-[#0052D4] to-[#6FB1FC]'
                                  : 'bg-slate-700'
                              }`}>
                                {lesson.status === 'completed' && (
                                  <motion.div
                                    className="absolute inset-0 rounded-full bg-green-400/30"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  />
                                )}
                                {lesson.status === 'completed' ? (
                                  <CheckCircle className="w-5 h-5 text-white" />
                                ) : lesson.status === 'locked' ? (
                                  <Lock className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <Zap className="w-5 h-5 text-white" />
                                )}
                              </div>

                              {/* Lesson name */}
                              <span className={`flex-1 text-left font-medium ${
                                lesson.status === 'locked' ? 'text-gray-500' : 'text-white'
                              }`}>
                                {lesson.name}
                              </span>

                              {/* Stars with animation */}
                              {lesson.status === 'completed' && (
                                <div className="flex gap-1">
                                  {[1, 2, 3].map((star) => (
                                    <motion.div
                                      key={star}
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ delay: lessonIndex * 0.05 + star * 0.1 }}
                                    >
                                      <Star
                                        className={`w-4 h-4 ${
                                          star <= lesson.stars
                                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]'
                                            : 'text-slate-600'
                                        }`}
                                      />
                                    </motion.div>
                                  ))}
                                </div>
                              )}

                              {/* Available indicator */}
                              {lesson.status === 'available' && (
                                <motion.span
                                  className="text-xs px-2 py-1 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-medium"
                                  animate={{ opacity: [0.7, 1, 0.7] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  JOUER
                                </motion.span>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      <BottomNav />
    </div>
  )
}
