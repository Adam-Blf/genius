import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnimatedCounter } from '../ui/AnimatedCounter';

type StatVariant = 'default' | 'gradient' | 'glass' | 'outline';
type TrendDirection = 'up' | 'down' | 'neutral';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    direction: TrendDirection;
    value: number;
    label?: string;
  };
  variant?: StatVariant;
  color?: 'blue' | 'cyan' | 'green' | 'orange' | 'purple' | 'pink';
  animated?: boolean;
  onClick?: () => void;
  className?: string;
}

const colorStyles = {
  blue: {
    bg: 'bg-[#4364F7]/10',
    border: 'border-[#4364F7]/20',
    icon: 'text-[#4364F7]',
    gradient: 'from-[#0052D4] to-[#4364F7]',
  },
  cyan: {
    bg: 'bg-[#00E5FF]/10',
    border: 'border-[#00E5FF]/20',
    icon: 'text-[#00E5FF]',
    gradient: 'from-[#00E5FF] to-[#00B8D4]',
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: 'text-green-400',
    gradient: 'from-green-400 to-emerald-500',
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: 'text-orange-400',
    gradient: 'from-orange-400 to-amber-500',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: 'text-purple-400',
    gradient: 'from-purple-400 to-pink-500',
  },
  pink: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    icon: 'text-pink-400',
    gradient: 'from-pink-400 to-rose-500',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  color = 'blue',
  animated = true,
  onClick,
  className,
}: StatCardProps) {
  const colors = colorStyles[color];

  const variantClasses = {
    default: 'bg-slate-800/50 border-slate-700/50',
    gradient: `bg-gradient-to-br ${colors.gradient} border-transparent`,
    glass: 'bg-white/5 backdrop-blur-xl border-white/10',
    outline: `bg-transparent ${colors.border} border-2`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'p-4 rounded-2xl border transition-all',
        variantClasses[variant],
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              variant === 'gradient' ? 'bg-white/20' : colors.bg
            )}
          >
            <div className={variant === 'gradient' ? 'text-white' : colors.icon}>
              {icon}
            </div>
          </div>
        )}

        {/* Trend */}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              trend.direction === 'up' && 'bg-green-500/20 text-green-400',
              trend.direction === 'down' && 'bg-red-500/20 text-red-400',
              trend.direction === 'neutral' && 'bg-slate-500/20 text-slate-400'
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend.direction === 'neutral' && <Minus className="w-3 h-3" />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3">
        <div
          className={cn(
            'text-2xl font-bold',
            variant === 'gradient' ? 'text-white' : 'text-white'
          )}
        >
          {typeof value === 'number' && animated ? (
            <AnimatedCounter value={value} format="compact" />
          ) : (
            value
          )}
        </div>
        <div
          className={cn(
            'text-sm font-medium mt-0.5',
            variant === 'gradient' ? 'text-white/80' : 'text-slate-400'
          )}
        >
          {title}
        </div>
        {subtitle && (
          <div
            className={cn(
              'text-xs mt-1',
              variant === 'gradient' ? 'text-white/60' : 'text-slate-500'
            )}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Trend label */}
      {trend?.label && (
        <div
          className={cn(
            'text-xs mt-2',
            variant === 'gradient' ? 'text-white/60' : 'text-slate-500'
          )}
        >
          {trend.label}
        </div>
      )}
    </motion.div>
  );
}

// Stat grid layout
interface StatGridProps {
  stats: Array<{
    title: string;
    value: number | string;
    icon?: ReactNode;
    color?: StatCardProps['color'];
    trend?: StatCardProps['trend'];
  }>;
  columns?: 2 | 3 | 4;
  variant?: StatVariant;
  className?: string;
}

export function StatGrid({
  stats,
  columns = 2,
  variant = 'default',
  className,
}: StatGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
          variant={variant}
        />
      ))}
    </div>
  );
}

// Compact stat row
interface StatRowProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  suffix?: string;
  className?: string;
}

export function StatRow({ label, value, icon, suffix, className }: StatRowProps) {
  return (
    <div className={cn('flex items-center justify-between py-3', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
            {icon}
          </div>
        )}
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-white">
          {typeof value === 'number' ? (
            <AnimatedCounter value={value} />
          ) : (
            value
          )}
        </span>
        {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

// Big stat display
interface BigStatProps {
  value: number;
  label: string;
  sublabel?: string;
  prefix?: string;
  suffix?: string;
  color?: StatCardProps['color'];
  className?: string;
}

export function BigStat({
  value,
  label,
  sublabel,
  prefix,
  suffix,
  color = 'cyan',
  className,
}: BigStatProps) {
  const colors = colorStyles[color];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn('text-center', className)}
    >
      <div
        className={cn(
          'text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
          colors.gradient
        )}
      >
        {prefix}
        <AnimatedCounter value={value} duration={1.5} />
        {suffix}
      </div>
      <div className="text-lg font-medium text-white mt-2">{label}</div>
      {sublabel && (
        <div className="text-sm text-slate-500 mt-1">{sublabel}</div>
      )}
    </motion.div>
  );
}
