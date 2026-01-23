import { useState, useCallback, ReactNode, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, animate } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';

interface Card {
  id: string | number;
  content: ReactNode;
}

interface CardStackProps {
  cards: Card[];
  onSwipeLeft?: (card: Card) => void;
  onSwipeRight?: (card: Card) => void;
  onCardRemoved?: (card: Card, direction: 'left' | 'right') => void;
  onStackEmpty?: () => void;
  visibleCards?: number;
  swipeThreshold?: number;
  className?: string;
  renderOverlay?: (progress: number, direction: 'left' | 'right' | null) => ReactNode;
}

export function CardStack({
  cards,
  onSwipeLeft,
  onSwipeRight,
  onCardRemoved,
  onStackEmpty,
  visibleCards = 3,
  swipeThreshold = 100,
  className = '',
  renderOverlay,
}: CardStackProps) {
  const [stack, setStack] = useState(cards);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const { mediumTap } = useHaptics();
  const isAnimating = useRef(false);

  // Motion values for the top card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const swipeProgress = useTransform(x, [-swipeThreshold, 0, swipeThreshold], [-1, 0, 1]);

  // Update swipe direction based on drag
  swipeProgress.on('change', (value) => {
    if (value < -0.3) {
      setSwipeDirection('left');
    } else if (value > 0.3) {
      setSwipeDirection('right');
    } else {
      setSwipeDirection(null);
    }
  });

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (isAnimating.current || stack.length === 0) return;

      const { offset, velocity } = info;
      const swipeVelocity = Math.abs(velocity.x);
      const swipeOffset = Math.abs(offset.x);

      // Determine if it's a valid swipe
      if (swipeOffset > swipeThreshold || swipeVelocity > 500) {
        const direction = offset.x > 0 ? 'right' : 'left';
        isAnimating.current = true;
        mediumTap();

        // Animate card off screen
        const exitX = direction === 'right' ? 500 : -500;
        animate(x, exitX, {
          duration: 0.3,
          onComplete: () => {
            const removedCard = stack[0];
            setStack((prev) => prev.slice(1));
            x.set(0);
            isAnimating.current = false;
            setSwipeDirection(null);

            // Callbacks
            if (direction === 'left') {
              onSwipeLeft?.(removedCard);
            } else {
              onSwipeRight?.(removedCard);
            }
            onCardRemoved?.(removedCard, direction);

            // Check if stack is empty
            if (stack.length === 1) {
              onStackEmpty?.();
            }
          },
        });
      } else {
        // Snap back
        animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
        setSwipeDirection(null);
      }
    },
    [stack, swipeThreshold, x, mediumTap, onSwipeLeft, onSwipeRight, onCardRemoved, onStackEmpty]
  );

  // Programmatic swipe methods
  const swipe = useCallback(
    (direction: 'left' | 'right') => {
      if (isAnimating.current || stack.length === 0) return;

      isAnimating.current = true;
      mediumTap();
      setSwipeDirection(direction);

      const exitX = direction === 'right' ? 500 : -500;
      animate(x, exitX, {
        duration: 0.3,
        onComplete: () => {
          const removedCard = stack[0];
          setStack((prev) => prev.slice(1));
          x.set(0);
          isAnimating.current = false;
          setSwipeDirection(null);

          if (direction === 'left') {
            onSwipeLeft?.(removedCard);
          } else {
            onSwipeRight?.(removedCard);
          }
          onCardRemoved?.(removedCard, direction);

          if (stack.length === 1) {
            onStackEmpty?.();
          }
        },
      });
    },
    [stack, x, mediumTap, onSwipeLeft, onSwipeRight, onCardRemoved, onStackEmpty]
  );

  // Update stack when cards prop changes
  useState(() => {
    if (cards.length > stack.length) {
      setStack(cards);
    }
  });

  const visibleStack = stack.slice(0, visibleCards);

  return (
    <div className={`relative ${className}`} style={{ perspective: '1000px' }}>
      <AnimatePresence>
        {visibleStack.map((card, index) => {
          const isTop = index === 0;
          const scale = 1 - index * 0.05;
          const translateY = index * 8;
          const zIndex = visibleCards - index;

          return (
            <motion.div
              key={card.id}
              className="absolute inset-0"
              style={{
                zIndex,
                ...(isTop
                  ? { x, rotate }
                  : {}),
              }}
              initial={false}
              animate={{
                scale,
                y: translateY,
                opacity: index < 3 ? 1 : 0,
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.2 },
              }}
              transition={{
                scale: { duration: 0.2 },
                y: { duration: 0.2 },
              }}
              {...(isTop && {
                drag: 'x',
                dragConstraints: { left: 0, right: 0 },
                dragElastic: 0.7,
                onDragEnd: handleDragEnd,
                whileTap: { cursor: 'grabbing' },
              })}
            >
              {/* Card content */}
              <div className="w-full h-full">
                {card.content}
              </div>

              {/* Swipe overlay */}
              {isTop && renderOverlay && (
                <motion.div className="absolute inset-0 pointer-events-none">
                  {renderOverlay(
                    Math.abs(swipeProgress.get()),
                    swipeDirection
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Empty state */}
      {stack.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-slate-500 text-center">
            <p className="text-lg font-medium">Pile vide</p>
            <p className="text-sm">Plus de cartes disponibles</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Default swipe overlay with GENIUS/NOPE stamps
export function DefaultSwipeOverlay({
  progress,
  direction,
}: {
  progress: number;
  direction: 'left' | 'right' | null;
}) {
  const opacity = Math.min(progress * 2, 1);

  return (
    <>
      {/* GENIUS stamp (right swipe) */}
      {direction === 'right' && (
        <motion.div
          className="absolute top-8 left-8 px-4 py-2 rounded-xl font-bold text-2xl uppercase tracking-wider border-4 rotate-[-20deg]"
          style={{
            color: '#00E5FF',
            borderColor: '#00E5FF',
            backgroundColor: 'rgba(0, 229, 255, 0.1)',
            opacity,
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity }}
        >
          GENIUS
        </motion.div>
      )}

      {/* NOPE stamp (left swipe) */}
      {direction === 'left' && (
        <motion.div
          className="absolute top-8 right-8 px-4 py-2 rounded-xl font-bold text-2xl uppercase tracking-wider border-4 rotate-[20deg]"
          style={{
            color: '#FF5252',
            borderColor: '#FF5252',
            backgroundColor: 'rgba(255, 82, 82, 0.1)',
            opacity,
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity }}
        >
          NOPE
        </motion.div>
      )}
    </>
  );
}

// Hook to control CardStack programmatically
export function useCardStackRef() {
  const swipeLeft = useRef<() => void>(() => {});
  const swipeRight = useRef<() => void>(() => {});

  return {
    swipeLeft: () => swipeLeft.current(),
    swipeRight: () => swipeRight.current(),
    setSwipeLeft: (fn: () => void) => { swipeLeft.current = fn; },
    setSwipeRight: (fn: () => void) => { swipeRight.current = fn; },
  };
}
