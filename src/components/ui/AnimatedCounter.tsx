import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  triggerOnView?: boolean;
  format?: 'default' | 'compact' | 'thousands';
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  delay = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  triggerOnView = true,
  format = 'default',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [hasAnimated, setHasAnimated] = useState(!triggerOnView);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) => {
    const num = decimals > 0 ? current.toFixed(decimals) : Math.round(current);
    return formatNumber(Number(num), format);
  });

  useEffect(() => {
    if (triggerOnView && isInView && !hasAnimated) {
      setHasAnimated(true);
      setTimeout(() => {
        spring.set(value);
      }, delay * 1000);
    } else if (!triggerOnView) {
      spring.set(value);
    }
  }, [isInView, hasAnimated, triggerOnView, value, spring, delay]);

  // Update when value changes
  useEffect(() => {
    if (hasAnimated) {
      spring.set(value);
    }
  }, [value, hasAnimated, spring]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

function formatNumber(num: number, format: 'default' | 'compact' | 'thousands'): string {
  switch (format) {
    case 'compact':
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();

    case 'thousands':
      return num.toLocaleString('fr-FR');

    default:
      return num.toString();
  }
}

// XP Counter with special styling
interface XPCounterProps {
  value: number;
  showGain?: number;
  className?: string;
}

export function XPCounter({ value, showGain, className = '' }: XPCounterProps) {
  const [displayGain, setDisplayGain] = useState<number | null>(null);

  useEffect(() => {
    if (showGain && showGain > 0) {
      setDisplayGain(showGain);
      const timer = setTimeout(() => setDisplayGain(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [showGain]);

  return (
    <div className={`relative inline-flex items-center gap-1 ${className}`}>
      <span className="text-[#00E5FF] font-bold">
        <AnimatedCounter value={value} format="compact" duration={0.8} />
      </span>
      <span className="text-[#00E5FF]/70 text-sm">XP</span>

      {/* Gain indicator */}
      {displayGain && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: -20, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.5 }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-[#00E5FF] font-bold text-sm whitespace-nowrap"
        >
          +{displayGain}
        </motion.div>
      )}
    </div>
  );
}

// Streak counter with fire effect
interface StreakCounterProps {
  value: number;
  className?: string;
}

export function StreakCounter({ value, className = '' }: StreakCounterProps) {
  return (
    <div className={`relative inline-flex items-center gap-1 ${className}`}>
      <motion.span
        className="text-2xl"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 0.5,
          repeat: value > 0 ? Infinity : 0,
          repeatDelay: 2,
        }}
      >
        {value > 0 ? '' : ''}
      </motion.span>
      <span className="text-orange-400 font-bold">
        <AnimatedCounter value={value} duration={0.5} />
      </span>
      <span className="text-orange-400/70 text-sm">jours</span>
    </div>
  );
}

// Progress percentage with animation
interface ProgressCounterProps {
  value: number;
  total: number;
  className?: string;
}

export function ProgressCounter({ value, total, className = '' }: ProgressCounterProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-2xl font-bold text-white">
        <AnimatedCounter value={percentage} decimals={0} suffix="%" duration={1} />
      </div>
      <div className="text-slate-400 text-sm">
        <AnimatedCounter value={value} duration={0.8} /> / {total}
      </div>
    </div>
  );
}

// Level display with animated ring
interface LevelDisplayProps {
  level: number;
  xp: number;
  xpToNext: number;
  className?: string;
}

export function LevelDisplay({ level, xp, xpToNext, className = '' }: LevelDisplayProps) {
  const progress = xpToNext > 0 ? (xp / xpToNext) * 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative w-24 h-24 ${className}`}>
      {/* Background ring */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#334155"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0052D4" />
            <stop offset="50%" stopColor="#4364F7" />
            <stop offset="100%" stopColor="#6FB1FC" />
          </linearGradient>
        </defs>
      </svg>

      {/* Level number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-slate-400 text-xs uppercase tracking-wider">Niveau</span>
        <motion.span
          className="text-2xl font-bold text-white"
          key={level}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {level}
        </motion.span>
      </div>
    </div>
  );
}
