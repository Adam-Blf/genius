import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, Sparkles, Check, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DailyGoalWidgetProps {
  currentCards: number;
  goalCards: number;
  currentXP: number;
  goalXP: number;
  streak: number;
  className?: string;
  compact?: boolean;
}

export function DailyGoalWidget({
  currentCards,
  goalCards,
  currentXP,
  goalXP,
  streak,
  className,
  compact = false,
}: DailyGoalWidgetProps) {
  const cardsProgress = useMemo(() => {
    return Math.min((currentCards / goalCards) * 100, 100);
  }, [currentCards, goalCards]);

  const xpProgress = useMemo(() => {
    return Math.min((currentXP / goalXP) * 100, 100);
  }, [currentXP, goalXP]);

  const isCardsComplete = cardsProgress >= 100;
  const isXPComplete = xpProgress >= 100;
  const isDailyComplete = isCardsComplete && isXPComplete;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {/* Streak */}
        <div className="flex items-center gap-1 text-orange-400">
          <Flame className="w-4 h-4" />
          <span className="text-sm font-bold">{streak}</span>
        </div>

        {/* Progress ring */}
        <div className="relative w-10 h-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#334155"
              strokeWidth="3"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 94.2 }}
              animate={{ strokeDashoffset: 94.2 - (94.2 * (cardsProgress + xpProgress) / 200) }}
              style={{ strokeDasharray: 94.2 }}
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0052D4" />
                <stop offset="100%" stopColor="#00E5FF" />
              </linearGradient>
            </defs>
          </svg>
          {isDailyComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-[#00E5FF]" />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">
                {Math.round((cardsProgress + xpProgress) / 2)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50',
        isDailyComplete && 'border-[#00E5FF]/30 bg-[#00E5FF]/5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              isDailyComplete ? 'bg-[#00E5FF]/20' : 'bg-primary-500/20'
            )}
          >
            {isDailyComplete ? (
              <Sparkles className="w-4 h-4 text-[#00E5FF]" />
            ) : (
              <Target className="w-4 h-4 text-primary-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Objectif du jour</h3>
            {isDailyComplete && (
              <p className="text-xs text-[#00E5FF]">Complete !</p>
            )}
          </div>
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <motion.div
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20"
            animate={streak > 7 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-bold text-orange-400">{streak}j</span>
          </motion.div>
        )}
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        {/* Cards progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Cartes</span>
            <span className="text-xs font-medium text-white">
              {currentCards}/{goalCards}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isCardsComplete
                  ? 'linear-gradient(90deg, #00E5FF, #00B8D4)'
                  : 'linear-gradient(90deg, #0052D4, #4364F7)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${cardsProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* XP progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> XP
            </span>
            <span className="text-xs font-medium text-white">
              {currentXP}/{goalXP}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isXPComplete
                  ? 'linear-gradient(90deg, #00E5FF, #00B8D4)'
                  : 'linear-gradient(90deg, #4364F7, #6FB1FC)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
        </div>
      </div>

      {/* Motivational message */}
      {!isDailyComplete && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-xs text-slate-500 text-center"
        >
          {cardsProgress < 50
            ? 'Continue comme ca !'
            : cardsProgress < 100
            ? 'Tu y es presque !'
            : 'Encore un peu de XP !'}
        </motion.p>
      )}

      {/* Completion celebration */}
      {isDailyComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 p-2 rounded-xl bg-gradient-to-r from-[#00E5FF]/10 to-[#0052D4]/10 border border-[#00E5FF]/20 text-center"
        >
          <p className="text-xs text-[#00E5FF] font-medium">
            Bravo ! Reviens demain pour garder ta serie
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Circular progress variant
interface CircularGoalProps {
  current: number;
  goal: number;
  label: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CircularGoal({
  current,
  goal,
  label,
  icon,
  size = 'md',
  className,
}: CircularGoalProps) {
  const progress = Math.min((current / goal) * 100, 100);
  const isComplete = progress >= 100;

  const sizes = {
    sm: { container: 'w-16 h-16', stroke: 3, text: 'text-xs' },
    md: { container: 'w-24 h-24', stroke: 4, text: 'text-sm' },
    lg: { container: 'w-32 h-32', stroke: 5, text: 'text-base' },
  };

  const { container, stroke, text } = sizes[size];
  const radius = size === 'sm' ? 28 : size === 'md' ? 44 : 58;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className={cn('relative', container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#334155"
            strokeWidth={stroke}
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={isComplete ? '#00E5FF' : 'url(#goal-gradient)'}
            strokeWidth={stroke}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * progress) / 100 }}
            style={{ strokeDasharray: circumference }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="goal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0052D4" />
              <stop offset="50%" stopColor="#4364F7" />
              <stop offset="100%" stopColor="#6FB1FC" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && (
            <div className={cn('mb-1', isComplete ? 'text-[#00E5FF]' : 'text-slate-400')}>
              {icon}
            </div>
          )}
          <span className={cn('font-bold text-white', text)}>
            {current}
          </span>
        </div>
      </div>

      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
