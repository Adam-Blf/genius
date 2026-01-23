/**
 * Onboarding Flow - Complete Tutorial Experience
 * Features: Welcome, Features intro, User info collection, Preferences
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Brain,
  FileText,
  GraduationCap,
  Target,
  Clock,
  Zap,
  ChevronRight
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { RalphMascot } from '../components/ralph/RalphMascot'
import { cn } from '../lib/utils'
import { useOnboardingContext } from '../contexts/OnboardingContext'
import { useUserData } from '../contexts/UserDataContext'

// Step definitions
type OnboardingStep =
  | 'welcome'
  | 'features-revision'
  | 'features-llm'
  | 'features-stats'
  | 'name'
  | 'level'
  | 'categories'
  | 'goals'
  | 'daily-time'
  | 'complete'

const STEPS: OnboardingStep[] = [
  'welcome',
  'features-revision',
  'features-llm',
  'features-stats',
  'name',
  'level',
  'categories',
  'goals',
  'daily-time',
  'complete'
]

// Difficulty levels
const levels = [
  { id: 'beginner', name: 'Debutant', emoji: '🌱', description: 'Je debute en culture generale' },
  { id: 'intermediate', name: 'Intermediaire', emoji: '📚', description: "J'ai quelques connaissances" },
  { id: 'expert', name: 'Expert', emoji: '🧠', description: 'Je suis un pro du quiz' }
]

// Learning categories
const categories = [
  { id: 'history', name: 'Histoire', emoji: '📜' },
  { id: 'science', name: 'Sciences', emoji: '🔬' },
  { id: 'geo', name: 'Geographie', emoji: '🌍' },
  { id: 'arts', name: 'Arts', emoji: '🎨' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
  { id: 'entertainment', name: 'Divertissement', emoji: '🎬' },
  { id: 'tech', name: 'Technologie', emoji: '💻' },
  { id: 'nature', name: 'Nature', emoji: '🌿' }
]

// Learning goals
const learningGoalsOptions = [
  { id: 'culture', label: 'Enrichir ma culture generale', emoji: '📚' },
  { id: 'exam', label: 'Preparer un examen', emoji: '📝' },
  { id: 'fun', label: "M'amuser en apprenant", emoji: '🎮' },
  { id: 'memory', label: 'Ameliorer ma memoire', emoji: '🧠' },
  { id: 'conversation', label: 'Briller en conversation', emoji: '💬' },
  { id: 'curiosity', label: 'Satisfaire ma curiosite', emoji: '🔍' }
]

// Daily time options
const dailyTimeOptions = [
  { minutes: 5, label: '5 min', description: 'Debutant' },
  { minutes: 10, label: '10 min', description: 'Leger' },
  { minutes: 15, label: '15 min', description: 'Modere' },
  { minutes: 30, label: '30 min', description: 'Serieux' },
  { minutes: 60, label: '1 heure', description: 'Intensif' }
]

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
}

const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30
}

export function OnboardingFlowPage() {
  const navigate = useNavigate()
  const { progress, saveProgress, completeOnboarding } = useOnboardingContext()
  const { updateProfile, updatePreferences } = useUserData()

  const [currentStepIndex, setCurrentStepIndex] = useState(progress.currentStep)
  const [displayName, setDisplayName] = useState(progress.displayName)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(progress.selectedLevel)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(progress.selectedCategories)
  const [selectedGoals, setSelectedGoals] = useState<string[]>(progress.learningGoals)
  const [dailyMinutes, setDailyMinutes] = useState(progress.dailyGoalMinutes)
  const [isAnimating, setIsAnimating] = useState(false)

  const currentStep = STEPS[currentStepIndex]
  const totalSteps = STEPS.length

  // Save progress whenever state changes
  useEffect(() => {
    saveProgress({
      currentStep: currentStepIndex,
      displayName,
      selectedLevel,
      selectedCategories,
      learningGoals: selectedGoals,
      dailyGoalMinutes: dailyMinutes
    })
  }, [currentStepIndex, displayName, selectedLevel, selectedCategories, selectedGoals, dailyMinutes, saveProgress])

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome':
      case 'features-revision':
      case 'features-llm':
      case 'features-stats':
        return true
      case 'name':
        return displayName.trim().length >= 2
      case 'level':
        return selectedLevel !== null
      case 'categories':
        return selectedCategories.length >= 1
      case 'goals':
        return selectedGoals.length >= 1
      case 'daily-time':
        return dailyMinutes > 0
      case 'complete':
        return true
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (isAnimating) return
    if (!canProceed()) return

    setIsAnimating(true)

    if (currentStep === 'complete') {
      // Save all data to user profile
      updateProfile({
        nickname: displayName.trim(),
        favoriteSubjects: selectedCategories,
        dailyGoalMinutes: dailyMinutes,
        preferredDifficulty: selectedLevel === 'beginner' ? 'easy' : selectedLevel === 'expert' ? 'hard' : 'mixed'
      })

      // Also save display name in legacy location for compatibility
      localStorage.setItem('genius_display_name', displayName.trim())

      // Mark onboarding as complete
      completeOnboarding()

      // Navigate to home
      navigate('/', { replace: true })
    } else {
      setCurrentStepIndex(prev => Math.min(prev + 1, totalSteps - 1))
    }

    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleBack = () => {
    if (isAnimating) return
    if (currentStepIndex > 0) {
      setIsAnimating(true)
      setCurrentStepIndex(prev => prev - 1)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  // Calculate progress percentage
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100

  return (
    <div className="min-h-screen bg-genius-bg flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header with back button and step indicator */}
      <div className="flex items-center justify-between p-4">
        <motion.button
          onClick={handleBack}
          className={cn(
            'p-2 rounded-full transition-opacity',
            currentStepIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
          )}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-6 h-6 text-gray-400" />
        </motion.button>

        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                i === currentStepIndex ? 'bg-primary-500' :
                i < currentStepIndex ? 'bg-primary-500/50' : 'bg-gray-700'
              )}
              initial={{ scale: 0.8 }}
              animate={{ scale: i === currentStepIndex ? 1.2 : 1 }}
            />
          ))}
        </div>

        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <RalphMascot mood="celebrating" size="xl" />
              </motion.div>

              <motion.h1
                className="text-3xl font-bold text-white mt-8 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Bienvenue sur Genius !
              </motion.h1>

              <motion.p
                className="text-gray-400 text-lg max-w-xs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Je suis Ralph, ton compagnon d'apprentissage. Laisse-moi te faire decouvrir l'app !
              </motion.p>

              <motion.div
                className="flex items-center gap-2 mt-8 text-primary-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm">Pret a devenir un genie ?</span>
              </motion.div>
            </motion.div>
          )}

          {/* Feature: Revision */}
          {currentStep === 'features-revision' && (
            <motion.div
              key="features-revision"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-8"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <FileText className="w-16 h-16 text-white" />
              </motion.div>

              <motion.h2
                className="text-2xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Revision Intelligente
              </motion.h2>

              <motion.p
                className="text-gray-400 text-base max-w-xs mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Importe tes cours et notes. L'IA les transforme automatiquement en flashcards interactives.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {['PDF', 'Photos', 'Texte'].map((format, i) => (
                  <motion.span
                    key={format}
                    className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    {format}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Feature: LLM Finetune */}
          {currentStep === 'features-llm' && (
            <motion.div
              key="features-llm"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-8"
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Brain className="w-16 h-16 text-white" />
              </motion.div>

              <motion.h2
                className="text-2xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                IA Personnalisee
              </motion.h2>

              <motion.p
                className="text-gray-400 text-base max-w-xs mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Configure ton propre LLM pour generer des questions adaptees a ton niveau et tes preferences.
              </motion.p>

              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 text-sm">100% local et prive</span>
              </motion.div>
            </motion.div>
          )}

          {/* Feature: Stats */}
          {currentStep === 'features-stats' && (
            <motion.div
              key="features-stats"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                className="w-32 h-32 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-8"
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Target className="w-16 h-16 text-white" />
              </motion.div>

              <motion.h2
                className="text-2xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Statistiques Locales
              </motion.h2>

              <motion.p
                className="text-gray-400 text-base max-w-xs mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Suis ta progression en temps reel. Tes donnees restent sur ton appareil, en toute confidentialite.
              </motion.p>

              <motion.div
                className="grid grid-cols-3 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  { label: 'Streak', value: '🔥' },
                  { label: 'XP', value: '⭐' },
                  { label: 'Badges', value: '🏆' }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <span className="text-2xl">{stat.value}</span>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Name Step */}
          {currentStep === 'name' && (
            <motion.div
              key="name"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <RalphMascot mood="happy" size="lg" className="mx-auto mb-6" />

              <h1 className="text-2xl font-bold text-white text-center mb-2">
                Comment tu t'appelles ?
              </h1>
              <p className="text-gray-400 text-center mb-8">
                Ralph veut savoir comment t'appeler !
              </p>

              <motion.input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ton prenom ou pseudo"
                className="input-field text-center text-lg py-4"
                maxLength={20}
                autoFocus
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              />

              {displayName.trim().length >= 2 && (
                <motion.p
                  className="text-center text-primary-400 mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Ravi de te rencontrer, {displayName} !
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Level Step */}
          {currentStep === 'level' && (
            <motion.div
              key="level"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
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
                {levels.map((level, i) => (
                  <motion.div
                    key={level.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    <Card
                      variant="default"
                      padding="md"
                      interactive
                      onClick={() => setSelectedLevel(level.id)}
                      className={cn(
                        'border-2 transition-all',
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
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Check className="w-6 h-6 text-primary-400" />
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Categories Step */}
          {currentStep === 'categories' && (
            <motion.div
              key="categories"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <RalphMascot mood="idle" size="md" className="mx-auto mb-6" />

              <h1 className="text-2xl font-bold text-white text-center mb-2">
                Qu'est-ce qui t'interesse ?
              </h1>
              <p className="text-gray-400 text-center mb-8">
                Choisis au moins une categorie
              </p>

              <div className="grid grid-cols-2 gap-3">
                {categories.map((category, i) => {
                  const isSelected = selectedCategories.includes(category.id)
                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05 * i }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'p-4 rounded-2xl border-2 transition-all text-center relative',
                        isSelected
                          ? 'border-primary-500 bg-primary-500/20'
                          : 'border-genius-border bg-genius-card hover:bg-white/5'
                      )}
                    >
                      <span className="text-3xl block mb-2">{category.emoji}</span>
                      <span className={cn(
                        'font-medium text-sm',
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
                          <Check className="w-4 h-4 text-primary-400" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Goals Step */}
          {currentStep === 'goals' && (
            <motion.div
              key="goals"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <RalphMascot mood="happy" size="md" className="mx-auto mb-6" />

              <h1 className="text-2xl font-bold text-white text-center mb-2">
                Quels sont tes objectifs ?
              </h1>
              <p className="text-gray-400 text-center mb-8">
                Selectionne ce qui te motive
              </p>

              <div className="space-y-3">
                {learningGoalsOptions.map((goal, i) => {
                  const isSelected = selectedGoals.includes(goal.id)
                  return (
                    <motion.button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * i }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4',
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-genius-border bg-genius-card hover:bg-white/5'
                      )}
                    >
                      <span className="text-2xl">{goal.emoji}</span>
                      <span className={cn(
                        'flex-1 font-medium',
                        isSelected ? 'text-primary-400' : 'text-white'
                      )}>
                        {goal.label}
                      </span>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check className="w-5 h-5 text-primary-400" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Daily Time Step */}
          {currentStep === 'daily-time' && (
            <motion.div
              key="daily-time"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Clock className="w-10 h-10 text-white" />
                </motion.div>
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-2">
                Combien de temps par jour ?
              </h1>
              <p className="text-gray-400 text-center mb-8">
                Definis ton objectif quotidien
              </p>

              <div className="space-y-3">
                {dailyTimeOptions.map((option, i) => {
                  const isSelected = dailyMinutes === option.minutes
                  return (
                    <motion.button
                      key={option.minutes}
                      onClick={() => setDailyMinutes(option.minutes)}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * i }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between',
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-genius-border bg-genius-card hover:bg-white/5'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          'text-xl font-bold',
                          isSelected ? 'text-amber-400' : 'text-white'
                        )}>
                          {option.label}
                        </span>
                        <span className="text-sm text-gray-500">{option.description}</span>
                      </div>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check className="w-5 h-5 text-amber-400" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <RalphMascot mood="celebrating" size="xl" />
              </motion.div>

              <motion.h1
                className="text-3xl font-bold text-white mt-8 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Tout est pret, {displayName} !
              </motion.h1>

              <motion.p
                className="text-gray-400 text-lg max-w-xs mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Ton profil est configure. Pret a commencer l'aventure ?
              </motion.p>

              {/* Summary */}
              <motion.div
                className="w-full max-w-sm space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-gray-400">Niveau</span>
                  <span className="text-white font-medium">
                    {levels.find(l => l.id === selectedLevel)?.emoji}{' '}
                    {levels.find(l => l.id === selectedLevel)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-gray-400">Categories</span>
                  <span className="text-white font-medium">
                    {selectedCategories.length} selectionnee{selectedCategories.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-gray-400">Objectif quotidien</span>
                  <span className="text-white font-medium">{dailyMinutes} min/jour</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom button */}
      <motion.div
        className="p-6 pt-0"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={handleNext}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!canProceed() || isAnimating}
          rightIcon={currentStep === 'complete' ? <Sparkles className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        >
          {currentStep === 'complete' ? "C'est parti !" : 'Continuer'}
        </Button>

        {/* Skip button for feature slides */}
        {['features-revision', 'features-llm', 'features-stats'].includes(currentStep) && (
          <motion.button
            onClick={() => setCurrentStepIndex(STEPS.indexOf('name'))}
            className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-400 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Passer l'introduction
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
