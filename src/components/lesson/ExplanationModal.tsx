import { motion } from 'framer-motion'
import { Check, X, Lightbulb } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { RalphMascot } from '../ralph/RalphMascot'

interface ExplanationModalProps {
  isOpen: boolean
  isCorrect: boolean
  correctAnswer: string
  explanation: string
  xpEarned: number
  onContinue: () => void
}

export function ExplanationModal({
  isOpen,
  isCorrect,
  correctAnswer,
  explanation,
  xpEarned,
  onContinue
}: ExplanationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onContinue}
      showCloseButton={false}
      size="md"
    >
      <div className="text-center space-y-4">
        {/* Ralph reaction */}
        <RalphMascot
          mood={isCorrect ? 'happy' : 'sad'}
          size="md"
          className="mx-auto"
        />

        {/* Result header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
        >
          {isCorrect ? (
            <div className="flex items-center justify-center gap-2 text-green-400">
              <Check className="w-8 h-8" />
              <span className="text-2xl font-bold">Correct !</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-red-400">
              <X className="w-8 h-8" />
              <span className="text-2xl font-bold">Incorrect</span>
            </div>
          )}
        </motion.div>

        {/* XP earned (only if correct) */}
        {isCorrect && xpEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-accent-400 font-bold text-lg"
          >
            +{xpEarned} XP
          </motion.div>
        )}

        {/* Correct answer (if wrong) */}
        {!isCorrect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-green-500/10 border border-green-500/30 rounded-xl p-3"
          >
            <p className="text-sm text-gray-400 mb-1">Bonne réponse:</p>
            <p className="text-green-400 font-semibold">{correctAnswer}</p>
          </motion.div>
        )}

        {/* Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 text-left"
        >
          <div className="flex items-center gap-2 mb-2 text-primary-400">
            <Lightbulb className="w-5 h-5" />
            <span className="font-semibold">Le savais-tu ?</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {explanation}
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onContinue}
            variant={isCorrect ? 'success' : 'primary'}
            size="lg"
            className="w-full"
          >
            Continuer
          </Button>
        </motion.div>
      </div>
    </Modal>
  )
}
