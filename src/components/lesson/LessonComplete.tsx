import { motion } from 'framer-motion'
import { Trophy, Target, Clock, Flame, Star, Share2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { RalphMascot } from '../ralph/RalphMascot'
import type { LessonResult } from '../../types/game'
import { formatTime } from '../../lib/utils'

interface LessonCompleteProps {
  result: LessonResult
  onContinue: () => void
  onShare?: () => void
}

export function LessonComplete({ result, onContinue, onShare }: LessonCompleteProps) {
  const {
    totalXp,
    correctAnswers,
    totalQuestions,
    accuracy,
    timeSpent,
    newStreak,
    perfectLesson
  } = result

  const stats = [
    {
      icon: <Trophy className="w-6 h-6" />,
      label: 'XP Gagnés',
      value: `+${totalXp}`,
      color: 'text-accent-400'
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: 'Précision',
      value: `${Math.round(accuracy)}%`,
      color: accuracy >= 80 ? 'text-green-400' : accuracy >= 50 ? 'text-amber-400' : 'text-red-400'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: 'Temps',
      value: formatTime(Math.floor(timeSpent / 1000)),
      color: 'text-blue-400'
    },
    {
      icon: <Flame className="w-6 h-6" />,
      label: 'Série',
      value: `${newStreak} jours`,
      color: 'text-orange-400'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-genius-bg"
    >
      {/* Ralph celebrating */}
      <RalphMascot
        mood={perfectLesson ? 'celebrating' : 'happy'}
        size="xl"
        showSpeechBubble
        speechText={perfectLesson ? 'Parfait !' : 'Bien joué !'}
      />

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-white mt-6 mb-2 text-center"
      >
        {perfectLesson ? 'Leçon Parfaite !' : 'Leçon Terminée !'}
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 mb-8 text-center"
      >
        {correctAnswers}/{totalQuestions} bonnes réponses
      </motion.p>

      {/* Perfect lesson badge */}
      {perfectLesson && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 500, delay: 0.5 }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full mb-6"
        >
          <Star className="w-5 h-5 fill-white" />
          <span className="font-bold">Sans faute !</span>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <Card variant="glass" padding="md" className="text-center">
              <div className={`${stat.color} mb-2 flex justify-center`}>
                {stat.icon}
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stat.label}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button
          onClick={onContinue}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Continuer
        </Button>

        {onShare && (
          <Button
            onClick={onShare}
            variant="ghost"
            size="lg"
            className="w-full"
            leftIcon={<Share2 className="w-5 h-5" />}
          >
            Partager mes résultats
          </Button>
        )}
      </motion.div>
    </motion.div>
  )
}
