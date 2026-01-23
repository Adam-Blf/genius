import { motion } from 'framer-motion'
import type { ShuffledQuestion } from '../../types/game'
import { Card } from '../ui/Card'

interface QuestionCardProps {
  question: ShuffledQuestion
  questionNumber: number
  totalQuestions: number
}

export function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
    >
      <Card variant="glass" padding="lg" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">
            Question {questionNumber} / {totalQuestions}
          </span>
          <span className="text-sm font-medium text-primary-400">
            +{question.xp_reward} XP
          </span>
        </div>

        <h2 className="text-xl font-semibold text-white leading-relaxed">
          {question.question_text}
        </h2>

        {/* Difficulty indicator */}
        <div className="flex items-center gap-1 mt-4">
          <span className="text-xs text-gray-500 mr-2">Difficulté:</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < question.difficulty
                  ? 'bg-primary-500'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
