import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: SwitchSize;
  label?: string;
  description?: string;
  labelPosition?: 'left' | 'right';
}

const sizeStyles: Record<SwitchSize, { track: string; thumb: string; thumbSize: number; trackWidth: number }> = {
  sm: { track: 'w-8 h-5', thumb: 'w-3.5 h-3.5', thumbSize: 14, trackWidth: 32 },
  md: { track: 'w-11 h-6', thumb: 'w-4.5 h-4.5', thumbSize: 18, trackWidth: 44 },
  lg: { track: 'w-14 h-8', thumb: 'w-6 h-6', thumbSize: 24, trackWidth: 56 },
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      size = 'md',
      label,
      description,
      labelPosition = 'right',
      className,
      checked,
      disabled,
      onChange,
      ...props
    },
    ref
  ) => {
    const { track, thumbSize, trackWidth } = sizeStyles[size];
    const thumbOffset = checked ? trackWidth - thumbSize - 4 : 2;

    const switchElement = (
      <label
        className={cn(
          'relative inline-flex cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          {...props}
        />
        <span
          className={cn(
            'rounded-full transition-colors duration-200',
            track,
            checked
              ? 'bg-gradient-to-r from-[#0052D4] to-[#4364F7]'
              : 'bg-slate-700'
          )}
        >
          <motion.span
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md',
              disabled && 'bg-slate-300'
            )}
            style={{
              width: thumbSize,
              height: thumbSize,
            }}
            animate={{
              x: thumbOffset,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          />
        </span>
      </label>
    );

    if (!label && !description) {
      return switchElement;
    }

    return (
      <div
        className={cn(
          'flex items-center gap-3',
          labelPosition === 'left' && 'flex-row-reverse justify-end',
          className
        )}
      >
        {switchElement}
        <div className="flex flex-col">
          {label && (
            <span
              className={cn(
                'text-sm font-medium text-white',
                disabled && 'text-slate-400'
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-500">{description}</span>
          )}
        </div>
      </div>
    );
  }
);

Switch.displayName = 'Switch';

// Toggle button group
interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  size?: SwitchSize;
  fullWidth?: boolean;
  className?: string;
}

export function ToggleGroup({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  className,
}: ToggleGroupProps) {
  const paddingStyles: Record<SwitchSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <div
      className={cn(
        'inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700',
        fullWidth && 'w-full',
        className
      )}
    >
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
            paddingStyles[size],
            fullWidth && 'flex-1',
            value === option.value
              ? 'text-white'
              : 'text-slate-400 hover:text-slate-300'
          )}
        >
          {value === option.value && (
            <motion.div
              layoutId="toggle-active"
              className="absolute inset-0 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 100%)',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {option.icon}
            {option.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// Checkbox component
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, indeterminate, className, checked, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          'flex items-start gap-3 cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            disabled={disabled}
            {...props}
          />
          <motion.div
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
              checked || indeterminate
                ? 'bg-[#4364F7] border-[#4364F7]'
                : 'border-slate-600 bg-slate-800'
            )}
            whileTap={{ scale: 0.9 }}
          >
            {(checked || indeterminate) && (
              <motion.svg
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                {indeterminate ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                )}
              </motion.svg>
            )}
          </motion.div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-white">{label}</span>
            )}
            {description && (
              <span className="text-xs text-slate-500">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Radio component
interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className, checked, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          'flex items-start gap-3 cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="radio"
            className="sr-only peer"
            checked={checked}
            disabled={disabled}
            {...props}
          />
          <motion.div
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
              checked
                ? 'border-[#4364F7]'
                : 'border-slate-600'
            )}
            whileTap={{ scale: 0.9 }}
          >
            {checked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2.5 h-2.5 rounded-full bg-[#4364F7]"
              />
            )}
          </motion.div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-white">{label}</span>
            )}
            {description && (
              <span className="text-xs text-slate-500">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
