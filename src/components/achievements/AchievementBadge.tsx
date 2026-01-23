import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Star, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
type AchievementStatus = 'locked' | 'unlocked' | 'completed';

interface AchievementBadgeProps {
  title: string;
  description?: string;
  icon: string; // Emoji
  rarity?: AchievementRarity;
  status?: AchievementStatus;
  progress?: number; // 0-100
  maxProgress?: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const rarityStyles: Record<AchievementRarity, { gradient: string; glow: string; border: string }> = {
  common: {
    gradient: 'from-slate-400 to-slate-500',
    glow: 'rgba(148, 163, 184, 0.3)',
    border: 'border-slate-500',
  },
  rare: {
    gradient: 'from-[#0052D4] to-[#4364F7]',
    glow: 'rgba(67, 100, 247, 0.4)',
    border: 'border-[#4364F7]',
  },
  epic: {
    gradient: 'from-purple-500 to-pink-500',
    glow: 'rgba(168, 85, 247, 0.4)',
    border: 'border-purple-500',
  },
  legendary: {
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    glow: 'rgba(251, 191, 36, 0.5)',
    border: 'border-amber-400',
  },
};

const sizeStyles: Record<string, { container: string; icon: string; text: string }> = {
  sm: { container: 'w-14 h-14', icon: 'text-2xl', text: 'text-xs' },
  md: { container: 'w-20 h-20', icon: 'text-3xl', text: 'text-sm' },
  lg: { container: 'w-28 h-28', icon: 'text-5xl', text: 'text-base' },
};

export function AchievementBadge({
  title,
  description,
  icon,
  rarity = 'common',
  status = 'locked',
  progress,
  maxProgress = 100,
  onClick,
  size = 'md',
  showTooltip = true,
  className,
}: AchievementBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { gradient, glow, border } = rarityStyles[rarity];
  const { container, icon: iconSize, text } = sizeStyles[size];

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const progressPercent = progress !== undefined ? (progress / maxProgress) * 100 : null;

  return (
    <div className={cn('relative', className)}>
      {/* Badge */}
      <motion.button
        className={cn(
          'relative rounded-2xl flex items-center justify-center overflow-hidden',
          container,
          isLocked ? 'bg-slate-800 border border-slate-700' : `bg-gradient-to-br ${gradient}`,
          onClick && 'cursor-pointer',
          border
        )}
        onClick={onClick}
        onHoverStart={() => showTooltip && setShowDetails(true)}
        onHoverEnd={() => setShowDetails(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: !isLocked ? `0 0 20px ${glow}` : 'none',
        }}
      >
        {/* Background glow effect for unlocked */}
        {!isLocked && (
          <motion.div
            className="absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Icon or Lock */}
        <span
          className={cn(
            iconSize,
            isLocked && 'grayscale opacity-40'
          )}
        >
          {isLocked ? (
            <Lock className={cn(iconSize, 'text-slate-600')} />
          ) : (
            icon
          )}
        </span>

        {/* Completed checkmark */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-slate-900"
          >
            <Check className="w-3 h-3 text-white" />
          </motion.div>
        )}

        {/* Progress ring */}
        {progressPercent !== null && !isCompleted && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-slate-700"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progressPercent / 100 }}
              transition={{ duration: 0.5 }}
              style={{
                strokeDasharray: '289',
                strokeDashoffset: 289 - (289 * progressPercent) / 100,
              }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0052D4" />
                <stop offset="50%" stopColor="#4364F7" />
                <stop offset="100%" stopColor="#6FB1FC" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Legendary sparkle effect */}
        {rarity === 'legendary' && !isLocked && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <Sparkles className="absolute top-1 right-1 w-3 h-3 text-amber-300" />
            <Star className="absolute bottom-1 left-1 w-2 h-2 text-amber-300" />
          </motion.div>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 rounded-xl bg-slate-800 border border-slate-700 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={text}>{icon}</span>
              <span className={cn('font-bold text-white', text)}>{title}</span>
            </div>
            {description && (
              <p className="text-slate-400 text-xs">{description}</p>
            )}
            {progressPercent !== null && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Progression</span>
                  <span className="text-[#6FB1FC]">{progress}/{maxProgress}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#0052D4] to-[#6FB1FC]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
            <div className={cn(
              'mt-2 px-2 py-0.5 rounded-full text-xs font-medium inline-block',
              rarity === 'common' && 'bg-slate-600 text-slate-300',
              rarity === 'rare' && 'bg-[#4364F7]/30 text-[#6FB1FC]',
              rarity === 'epic' && 'bg-purple-500/30 text-purple-300',
              rarity === 'legendary' && 'bg-amber-500/30 text-amber-300'
            )}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Achievement unlock notification
interface AchievementUnlockProps {
  achievement: {
    title: string;
    icon: string;
    rarity: AchievementRarity;
  };
  onClose: () => void;
}

export function AchievementUnlock({ achievement, onClose }: AchievementUnlockProps) {
  const { gradient, glow } = rarityStyles[achievement.rarity];

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.9 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700"
        style={{ boxShadow: `0 0 40px ${glow}` }}
      >
        <motion.div
          className={`w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          <span className="text-3xl">{achievement.icon}</span>
        </motion.div>

        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-[#00E5FF] text-sm font-medium">Succes debloque !</span>
          </div>
          <h3 className="text-white font-bold text-lg">{achievement.title}</h3>
        </div>
      </div>
    </motion.div>
  );
}

// Achievement grid
interface AchievementGridProps {
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: AchievementRarity;
    status: AchievementStatus;
    progress?: number;
    maxProgress?: number;
  }>;
  onSelect?: (id: string) => void;
  className?: string;
}

export function AchievementGrid({ achievements, onSelect, className }: AchievementGridProps) {
  return (
    <div className={cn('grid grid-cols-4 gap-4', className)}>
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          {...achievement}
          onClick={() => onSelect?.(achievement.id)}
          size="md"
        />
      ))}
    </div>
  );
}
