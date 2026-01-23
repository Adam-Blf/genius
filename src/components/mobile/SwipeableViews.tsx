import { useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useHaptics } from '../../hooks/useHaptics';

interface SwipeableViewsProps {
  children: ReactNode[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  showDots?: boolean;
  threshold?: number;
  className?: string;
}

export function SwipeableViews({
  children,
  initialIndex = 0,
  onIndexChange,
  showDots = true,
  threshold = 50,
  className = '',
}: SwipeableViewsProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const { lightTap } = useHaptics();

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      if (offset.x < -threshold || velocity.x < -500) {
        // Swipe left - go to next
        if (currentIndex < children.length - 1) {
          setDirection(1);
          const newIndex = currentIndex + 1;
          setCurrentIndex(newIndex);
          onIndexChange?.(newIndex);
          lightTap();
        }
      } else if (offset.x > threshold || velocity.x > 500) {
        // Swipe right - go to previous
        if (currentIndex > 0) {
          setDirection(-1);
          const newIndex = currentIndex - 1;
          setCurrentIndex(newIndex);
          onIndexChange?.(newIndex);
          lightTap();
        }
      }
    },
    [currentIndex, children.length, threshold, onIndexChange, lightTap]
  );

  const goToIndex = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      onIndexChange?.(index);
      lightTap();
    },
    [currentIndex, onIndexChange, lightTap]
  );

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="w-full"
        >
          {children[currentIndex]}
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      {showDots && children.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 bg-gradient-to-r from-[#0052D4] to-[#4364F7]'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Tab-style swipeable component
interface SwipeableTabsProps {
  tabs: { label: string; content: ReactNode }[];
  initialIndex?: number;
  className?: string;
}

export function SwipeableTabs({
  tabs,
  initialIndex = 0,
  className = '',
}: SwipeableTabsProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { lightTap } = useHaptics();

  return (
    <div className={className}>
      {/* Tab headers */}
      <div className="flex border-b border-slate-700 mb-4">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              lightTap();
            }}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all relative ${
              index === currentIndex
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
            {index === currentIndex && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{
                  background:
                    'linear-gradient(90deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <SwipeableViews
        initialIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        showDots={false}
      >
        {tabs.map((tab) => tab.content)}
      </SwipeableViews>
    </div>
  );
}
