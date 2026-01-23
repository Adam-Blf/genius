import { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';

interface GeniusCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onFlip?: (isFlipped: boolean) => void;
  className?: string;
}

export interface GeniusCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
  flip: () => void;
}

export const GeniusCard = forwardRef<GeniusCardRef, GeniusCardProps>(function GeniusCard(
  {
    frontContent,
    backContent,
    onSwipeLeft,
    onSwipeRight,
    onFlip,
    className = '',
  },
  ref
) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const { lightTap, mediumTap } = useHaptics();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);

  // Stamp opacity based on drag position
  const geniusOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  // Card glow based on direction
  const glowColor = useTransform(
    x,
    [-150, 0, 150],
    [
      '0 0 30px rgba(255, 82, 82, 0.3)',
      '0 20px 40px -10px rgba(0, 82, 212, 0.15)',
      '0 0 30px rgba(0, 229, 255, 0.3)',
    ]
  );

  const handleFlip = () => {
    lightTap();
    setIsFlipped(!isFlipped);
    onFlip?.(!isFlipped);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset > threshold || velocity > 500) {
      // Swipe right - GENIUS
      setExitDirection('right');
      mediumTap();
      animate(x, 500, { duration: 0.3 });
      setTimeout(() => onSwipeRight?.(), 300);
    } else if (offset < -threshold || velocity < -500) {
      // Swipe left - NOPE
      setExitDirection('left');
      mediumTap();
      animate(x, -500, { duration: 0.3 });
      setTimeout(() => onSwipeLeft?.(), 300);
    } else {
      // Return to center
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  };

  // Programmatic swipe methods
  const swipeLeft = () => {
    setExitDirection('left');
    mediumTap();
    animate(x, -500, { duration: 0.3 });
    setTimeout(() => onSwipeLeft?.(), 300);
  };

  const swipeRight = () => {
    setExitDirection('right');
    mediumTap();
    animate(x, 500, { duration: 0.3 });
    setTimeout(() => onSwipeRight?.(), 300);
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    swipeLeft,
    swipeRight,
    flip: handleFlip,
  }));

  return (
    <motion.div
      className={`relative w-full max-w-[320px] mx-auto perspective-1000 ${className}`}
      style={{ aspectRatio: '3/4' }}
    >
      {/* Draggable container */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, boxShadow: glowColor }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        whileTap={{ scale: 0.98 }}
      >
        {/* 3D Flip container */}
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          onClick={handleFlip}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 backface-hidden rounded-card bg-white overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              boxShadow: '0 20px 40px -10px rgba(0, 82, 212, 0.15)',
            }}
          >
            {/* GENIUS stamp */}
            <motion.div
              className="stamp-genius pointer-events-none z-10"
              style={{ opacity: geniusOpacity }}
            >
              GENIUS
            </motion.div>

            {/* NOPE stamp */}
            <motion.div
              className="stamp-nope pointer-events-none z-10"
              style={{ opacity: nopeOpacity }}
            >
              NOPE
            </motion.div>

            {/* Front content */}
            <div className="w-full h-full p-6 flex flex-col">
              {frontContent}
            </div>
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 backface-hidden rounded-card bg-white overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: '0 20px 40px -10px rgba(0, 82, 212, 0.15)',
            }}
          >
            {/* GENIUS stamp */}
            <motion.div
              className="stamp-genius pointer-events-none z-10"
              style={{ opacity: geniusOpacity }}
            >
              GENIUS
            </motion.div>

            {/* NOPE stamp */}
            <motion.div
              className="stamp-nope pointer-events-none z-10"
              style={{ opacity: nopeOpacity }}
            >
              NOPE
            </motion.div>

            {/* Back content */}
            <div className="w-full h-full p-6 flex flex-col">
              {backContent}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Flip indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400 pointer-events-none">
        Tap to flip
      </div>
    </motion.div>
  );
});
