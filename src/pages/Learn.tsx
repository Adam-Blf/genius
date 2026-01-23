import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle, Star } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'

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

const mockCategories: Category[] = [
  {
    id: 'history',
    name: 'Histoire',
    emoji: '📜',
    color: 'from-amber-500 to-orange-600',
    progress: 40,
    lessons: [
      { id: 1, name: 'Antiquité', status: 'completed', stars: 3 },
      { id: 2, name: 'Moyen Âge', status: 'completed', stars: 2 },
      { id: 3, name: 'Renaissance', status: 'available', stars: 0 },
      { id: 4, name: 'Révolution', status: 'locked', stars: 0 },
      { id: 5, name: 'Guerres Mondiales', status: 'locked', stars: 0 }
    ]
  },
  {
    id: 'science',
    name: 'Sciences',
    emoji: '🔬',
    color: 'from-green-500 to-emerald-600',
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
    name: 'Géographie',
    emoji: '🌍',
    color: 'from-blue-500 to-cyan-600',
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
    color: 'from-purple-500 to-pink-600',
    progress: 0,
    lessons: [
      { id: 1, name: 'Peinture', status: 'available', stars: 0 },
      { id: 2, name: 'Musique', status: 'locked', stars: 0 },
      { id: 3, name: 'Cinéma', status: 'locked', stars: 0 }
    ]
  }
]

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
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold text-white mb-6"
        >
          Apprendre
        </motion.h1>

        {/* Category cards */}
        <div className="space-y-4">
          {mockCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant="default"
                padding="none"
                className="overflow-hidden"
              >
                {/* Category header */}
                <button
                  onClick={() => setSelectedCategory(
                    selectedCategory?.id === category.id ? null : category
                  )}
                  className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                    {category.emoji}
                  </div>

                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <ProgressBar
                        value={category.progress}
                        max={100}
                        size="sm"
                        color="primary"
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500">{category.progress}%</span>
                    </div>
                  </div>

                  <motion.span
                    animate={{ rotate: selectedCategory?.id === category.id ? 180 : 0 }}
                    className="text-gray-400"
                  >
                    ▼
                  </motion.span>
                </button>

                {/* Lessons list */}
                <motion.div
                  initial={false}
                  animate={{
                    height: selectedCategory?.id === category.id ? 'auto' : 0,
                    opacity: selectedCategory?.id === category.id ? 1 : 0
                  }}
                  className="overflow-hidden border-t border-genius-border"
                >
                  <div className="p-2">
                    {category.lessons.map((lesson, lessonIndex) => (
                      <motion.button
                        key={lesson.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: lessonIndex * 0.05 }}
                        onClick={() => handleLessonClick(lesson, category.id)}
                        disabled={lesson.status === 'locked'}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          lesson.status === 'locked'
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        {/* Status icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          lesson.status === 'completed'
                            ? 'bg-green-500/20'
                            : lesson.status === 'available'
                            ? 'bg-primary-500/20'
                            : 'bg-gray-700'
                        }`}>
                          {lesson.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : lesson.status === 'locked' ? (
                            <Lock className="w-5 h-5 text-gray-500" />
                          ) : (
                            <span className="text-primary-400 font-bold">{lesson.id}</span>
                          )}
                        </div>

                        {/* Lesson name */}
                        <span className={`flex-1 text-left font-medium ${
                          lesson.status === 'locked' ? 'text-gray-500' : 'text-white'
                        }`}>
                          {lesson.name}
                        </span>

                        {/* Stars */}
                        {lesson.status === 'completed' && (
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= lesson.stars
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
