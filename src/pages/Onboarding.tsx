import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { RalphMascot } from '../components/ralph/RalphMascot'
import { cn } from '../lib/utils'

type Step = 'name' | 'level' | 'categories'

const levels = [
  { id: 'beginner', name: 'Débutant', emoji: '🌱', description: 'Je débute en culture générale' },
  { id: 'intermediate', name: 'Intermédiaire', emoji: '📚', description: 'J\'ai quelques connaissances' },
  { id: 'expert', name: 'Expert', emoji: '🧠', description: 'Je suis un pro du quiz' }
]

const categories = [
  { id: 'history', name: 'Histoire', emoji: '📜' },
  { id: 'science', name: 'Sciences', emoji: '🔬' },
  { id: 'geo', name: 'Géographie', emoji: '🌍' },
  { id: 'arts', name: 'Arts', emoji: '🎨' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
  { id: 'entertainment', name: 'Divertissement', emoji: '🎬' }
]

export function OnboardingPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('name')
  const [displayName, setDisplayName] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleNext = async () => {
    if (step === 'name' && displayName.trim()) {
      setStep('level')
    } else if (step === 'level' && selectedLevel) {
      setStep('categories')
    } else if (step === 'categories' && selectedCategories.length > 0) {
      setIsLoading(true)
      try {
        // No auth, just save to localStorage
        localStorage.setItem('genius_display_name', displayName.trim())
        navigate('/')
      } catch (error) {
        console.error('Failed to save preferences:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const canProceed = () => {
    switch (step) {
      case 'name': return displayName.trim().length >= 2
      case 'level': return selectedLevel !== null
      case 'categories': return selectedCategories.length >= 1
    }
  }

  return (
    <div className="min-h-screen bg-genius-bg p-6 flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {(['name', 'level', 'categories'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={cn(
              'w-3 h-3 rounded-full transition-colors',
              s === step ? 'bg-primary-500' :
              ['name', 'level', 'categories'].indexOf(step) > i ? 'bg-primary-500/50' : 'bg-gray-700'
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Name */}
        {step === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <RalphMascot mood="happy" size="lg" className="mx-auto mb-6" />

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Comment tu t'appelles ?
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Ralph veut savoir comment t'appeler !
            </p>

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ton prénom ou pseudo"
              className="input-field text-center text-lg py-4"
              maxLength={20}
              autoFocus
            />
          </motion.div>
        )}

        {/* Step 2: Level */}
        {step === 'level' && (
          <motion.div
            key="level"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <RalphMascot mood="thinking" size="md" className="mx-auto mb-6" />

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Quel est ton niveau ?
            </h1>
            <p className="text-gray-400 text-center mb-8">
              On adaptera les questions pour toi
            </p>

            <div className="space-y-3">
              {levels.map((level) => (
                <Card
                  key={level.id}
                  variant="default"
                  padding="md"
                  interactive
                  onClick={() => setSelectedLevel(level.id)}
                  className={cn(
                    'border-2 transition-colors',
                    selectedLevel === level.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-transparent'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{level.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{level.name}</p>
                      <p className="text-sm text-gray-400">{level.description}</p>
                    </div>
                    {selectedLevel === level.id && (
                      <Check className="w-6 h-6 text-primary-400" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Categories */}
        {step === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <RalphMascot mood="idle" size="md" className="mx-auto mb-6" />

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Qu'est-ce qui t'intéresse ?
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Choisis au moins une catégorie
            </p>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id)
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all text-center',
                      isSelected
                        ? 'border-primary-500 bg-primary-500/20'
                        : 'border-genius-border bg-genius-card hover:bg-white/5'
                    )}
                  >
                    <span className="text-3xl block mb-2">{category.emoji}</span>
                    <span className={cn(
                      'font-medium',
                      isSelected ? 'text-primary-400' : 'text-white'
                    )}>
                      {category.name}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="w-5 h-5 text-primary-400" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-auto pt-6"
      >
        <Button
          onClick={handleNext}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!canProceed()}
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          {step === 'categories' ? 'C\'est parti !' : 'Continuer'}
        </Button>
      </motion.div>
    </div>
  )
}
