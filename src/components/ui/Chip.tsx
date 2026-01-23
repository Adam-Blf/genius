import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

type ChipVariant = 'default' | 'primary' | 'genius' | 'cyan' | 'coral' | 'success' | 'warning';
type ChipSize = 'sm' | 'md' | 'lg';

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: ReactNode;
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

const variantStyles: Record<ChipVariant, string> = {
  default: 'bg-slate-700 text-slate-200 border-slate-600',
  primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
  genius: 'bg-gradient-to-r from-[#0052D4]/20 via-[#4364F7]/20 to-[#6FB1FC]/20 text-[#6FB1FC] border-[#4364F7]/30',
  cyan: 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/30',
  coral: 'bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const sizeStyles: Record<ChipSize, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
};

export function Chip({
  children,
  variant = 'default',
  size = 'md',
  icon,
  onRemove,
  onClick,
  selected = false,
  disabled = false,
  className,
}: ChipProps) {
  const isInteractive = onClick || onRemove;

  const content = (
    <>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 rounded-full hover:bg-white/10 p-0.5 transition-colors"
          disabled={disabled}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </>
  );

  const baseClasses = cn(
    'inline-flex items-center rounded-full border font-medium transition-all',
    variantStyles[variant],
    sizeStyles[size],
    isInteractive && !disabled && 'cursor-pointer hover:scale-105 active:scale-95',
    selected && 'ring-2 ring-offset-2 ring-offset-slate-900 ring-current',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  if (onClick) {
    return (
      <motion.button
        className={baseClasses}
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        {content}
      </motion.button>
    );
  }

  return <span className={baseClasses}>{content}</span>;
}

// Chip group for multiple selections
interface ChipGroupProps {
  children: ReactNode;
  className?: string;
}

export function ChipGroup({ children, className }: ChipGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>{children}</div>
  );
}

// Category chip with emoji
interface CategoryChipProps {
  category: string;
  emoji?: string;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryChip({
  category,
  emoji,
  count,
  selected = false,
  onClick,
  className,
}: CategoryChipProps) {
  return (
    <Chip
      variant={selected ? 'genius' : 'default'}
      selected={selected}
      onClick={onClick}
      icon={emoji && <span>{emoji}</span>}
      className={className}
    >
      {category}
      {count !== undefined && (
        <span className="ml-1 opacity-70">({count})</span>
      )}
    </Chip>
  );
}

// Filter chip with checkbox style
interface FilterChipProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function FilterChip({
  label,
  checked,
  onChange,
  disabled = false,
  className,
}: FilterChipProps) {
  return (
    <motion.button
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all',
        checked
          ? 'bg-gradient-to-r from-[#0052D4]/30 to-[#4364F7]/30 text-white border-[#4364F7]/50'
          : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={() => !disabled && onChange(!checked)}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      disabled={disabled}
    >
      <motion.div
        className={cn(
          'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
          checked
            ? 'bg-[#4364F7] border-[#4364F7]'
            : 'border-slate-500'
        )}
        animate={checked ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        {checked && (
          <motion.svg
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </motion.div>
      {label}
    </motion.button>
  );
}
