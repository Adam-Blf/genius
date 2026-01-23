import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle, Lightbulb, Clock, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHaptics } from '../../hooks/useHaptics';

interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizCardProps {
  question: string;
  answers: QuizAnswer[];
  questionNumber: number;
  totalQuestions: number;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // seconds
  xpReward?: number;
  hint?: string;
  explanation?: string;
  onAnswer: (answerId: string, isCorrect: boolean) => void;
  onTimeUp?: () => void;
  className?: string;
}

export function QuizCard({
  question,
  answers,
  questionNumber,
  totalQuestions,
  category,
  difficulty = 'medium',
  timeLimit,
  xpReward = 10,
  hint,
  explanation,
  onAnswer,
  onTimeUp,
  className,
}: QuizCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const { lightTap, mediumTap } = useHaptics();

  const difficultyColors = {
    easy: 'text-green-400 bg-green-500/20',
    medium: 'text-amber-400 bg-amber-500/20',
    hard: 'text-red-400 bg-red-500/20',
  };

  const handleSelectAnswer = (answerId: string) => {
    if (showResult) return;

    lightTap();
    setSelectedId(answerId);
  };

  const handleConfirm = () => {
    if (!selectedId || showResult) return;

    mediumTap();
    const answer = answers.find((a) => a.id === selectedId);
    setShowResult(true);
    onAnswer(selectedId, answer?.isCorrect ?? false);
  };

  const isCorrectAnswer = (id: string) => answers.find((a) => a.id === id)?.isCorrect;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">
            Question {questionNumber}/{totalQuestions}
          </span>
          {category && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#4364F7]/20 text-[#6FB1FC]">
              {category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {difficulty && (
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                difficultyColors[difficulty]
              )}
            >
              {difficulty === 'easy' ? 'Facile' : difficulty === 'medium' ? 'Moyen' : 'Difficile'}
            </span>
          )}

          {xpReward && (
            <span className="flex items-center gap-1 text-xs text-[#00E5FF]">
              <Zap className="w-3 h-3" /> +{xpReward}
            </span>
          )}
        </div>
      </div>

      {/* Timer */}
      {timeLimit && timeRemaining !== undefined && timeRemaining > 0 && !showResult && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">{timeRemaining}s</span>
          </div>
          <div className="h-1 rounded-full bg-slate-700">
            <motion.div
              className={cn(
                'h-full rounded-full',
                timeRemaining > 10
                  ? 'bg-[#4364F7]'
                  : timeRemaining > 5
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              )}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeRemaining / timeLimit) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Question */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4364F7]/20 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4 text-[#6FB1FC]" />
          </div>
          <h2 className="text-lg font-semibold text-white leading-relaxed">
            {question}
          </h2>
        </div>

        {/* Hint */}
        {hint && !showResult && (
          <div className="mt-3 ml-11">
            {showHint ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
              >
                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <Lightbulb className="w-4 h-4" />
                  <span className="font-medium">Indice :</span>
                </div>
                <p className="mt-1 text-sm text-amber-300/80">{hint}</p>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <Lightbulb className="w-3 h-3" />
                Voir un indice
              </button>
            )}
          </div>
        )}
      </div>

      {/* Answers */}
      <div className="space-y-3">
        {answers.map((answer, index) => {
          const isSelected = selectedId === answer.id;
          const showCorrect = showResult && answer.isCorrect;
          const showWrong = showResult && isSelected && !answer.isCorrect;

          return (
            <motion.button
              key={answer.id}
              onClick={() => handleSelectAnswer(answer.id)}
              disabled={showResult}
              className={cn(
                'w-full p-4 rounded-2xl text-left transition-all border-2',
                !showResult && !isSelected && 'bg-slate-800 border-slate-700 hover:border-slate-600',
                !showResult && isSelected && 'bg-[#4364F7]/20 border-[#4364F7]',
                showCorrect && 'bg-green-500/20 border-green-500',
                showWrong && 'bg-red-500/20 border-red-500'
              )}
              whileHover={!showResult ? { scale: 1.01 } : undefined}
              whileTap={!showResult ? { scale: 0.99 } : undefined}
            >
              <div className="flex items-center gap-3">
                {/* Letter indicator */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                    !showResult && 'bg-slate-700 text-slate-300',
                    !showResult && isSelected && 'bg-[#4364F7] text-white',
                    showCorrect && 'bg-green-500 text-white',
                    showWrong && 'bg-red-500 text-white'
                  )}
                >
                  {showCorrect ? (
                    <Check className="w-4 h-4" />
                  ) : showWrong ? (
                    <X className="w-4 h-4" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>

                {/* Answer text */}
                <span
                  className={cn(
                    'flex-1 text-sm',
                    !showResult && 'text-slate-200',
                    showCorrect && 'text-green-300',
                    showWrong && 'text-red-300'
                  )}
                >
                  {answer.text}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Confirm button */}
      {!showResult && selectedId && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleConfirm}
          className="w-full mt-6 py-4 rounded-2xl text-white font-semibold"
          style={{
            background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          Confirmer
        </motion.button>
      )}

      {/* Explanation */}
      <AnimatePresence>
        {showResult && explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 rounded-2xl bg-slate-700/30 border border-slate-600/30"
          >
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-[#00E5FF]" />
              Explication
            </h3>
            <p className="text-sm text-slate-300">{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Quiz progress header
interface QuizProgressProps {
  current: number;
  total: number;
  correctCount: number;
  xpEarned: number;
  className?: string;
}

export function QuizProgress({
  current,
  total,
  correctCount,
  xpEarned,
  className,
}: QuizProgressProps) {
  const progress = (current / total) * 100;

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">
          Question {current}/{total}
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-sm">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-400">{correctCount}</span>
          </span>
          <span className="flex items-center gap-1 text-sm text-[#00E5FF]">
            <Zap className="w-4 h-4" />
            {xpEarned}
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#0052D4] via-[#4364F7] to-[#6FB1FC]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
