import { motion } from 'framer-motion';
import { X, RotateCcw, Heart, Check, Sparkles } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface FABControlsProps {
  onSwipeLeft: () => void;
  onFlip: () => void;
  onSwipeRight: () => void;
  variant?: 'heart' | 'check' | 'sparkles';
  disabled?: boolean;
}

export function FABControls({
  onSwipeLeft,
  onFlip,
  onSwipeRight,
  variant = 'sparkles',
  disabled = false,
}: FABControlsProps) {
  const { lightTap, mediumTap } = useHaptics();

  const handleClick = (action: () => void, hapticType: 'light' | 'medium' = 'medium') => {
    if (disabled) return;
    if (hapticType === 'light') {
      lightTap();
    } else {
      mediumTap();
    }
    action();
  };

  const RightIcon = variant === 'heart' ? Heart : variant === 'check' ? Check : Sparkles;

  return (
    <div className="flex items-center justify-center gap-6 py-4">
      {/* NOPE Button - Left */}
      <motion.button
        className="fab-button fab-nope"
        onClick={() => handleClick(onSwipeLeft)}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        aria-label="Swipe left (Nope)"
      >
        <X className="w-8 h-8" strokeWidth={3} />
      </motion.button>

      {/* FLIP Button - Center */}
      <motion.button
        className="fab-button fab-flip w-14 h-14"
        onClick={() => handleClick(onFlip, 'light')}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        aria-label="Flip card"
      >
        <RotateCcw className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      {/* GENIUS Button - Right */}
      <motion.button
        className="fab-button fab-genius"
        onClick={() => handleClick(onSwipeRight)}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        aria-label="Swipe right (Genius)"
      >
        <RightIcon className="w-8 h-8" strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}

// Compact version for smaller screens
export function FABControlsCompact({
  onSwipeLeft,
  onFlip,
  onSwipeRight,
  disabled = false,
}: Omit<FABControlsProps, 'variant'>) {
  const { mediumTap } = useHaptics();

  const handleClick = (action: () => void) => {
    if (disabled) return;
    mediumTap();
    action();
  };

  return (
    <div className="flex items-center justify-center gap-4 py-3">
      {/* NOPE */}
      <motion.button
        className="w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center transition-all"
        style={{ borderColor: '#FF5252' }}
        onClick={() => handleClick(onSwipeLeft)}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
      >
        <X className="w-6 h-6" style={{ color: '#FF5252' }} strokeWidth={3} />
      </motion.button>

      {/* FLIP */}
      <motion.button
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
        }}
        onClick={() => handleClick(onFlip)}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
      >
        <RotateCcw className="w-5 h-5 text-white" strokeWidth={2.5} />
      </motion.button>

      {/* GENIUS */}
      <motion.button
        className="w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center transition-all"
        style={{ borderColor: '#00E5FF' }}
        onClick={() => handleClick(onSwipeRight)}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="w-6 h-6" style={{ color: '#00E5FF' }} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}

// Floating version that sticks to bottom
export function FABControlsFloating(props: FABControlsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 safe-area-bottom bg-gradient-to-t from-[#0F172A] via-[#0F172A]/95 to-transparent pt-8 pb-4">
      <FABControls {...props} />
    </div>
  );
}
