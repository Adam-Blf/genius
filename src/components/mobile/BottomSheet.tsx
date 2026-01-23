import { useEffect, useCallback, ReactNode, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { useHaptics } from '../../hooks/useHaptics';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[];
  initialSnap?: number;
  showHandle?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  showHandle = true,
  showCloseButton = true,
  className = '',
}: BottomSheetProps) {
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);
  const { lightTap, mediumTap } = useHaptics();
  const currentSnapIndex = useRef(initialSnap);

  // Calculate snap positions as pixels
  const getSnapY = useCallback(
    (index: number) => {
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      const snapHeight = snapPoints[index] * windowHeight;
      return windowHeight - snapHeight;
    },
    [snapPoints]
  );

  // Handle drag end and snap to closest point
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

      // Fast swipe down - close
      if (velocity.y > 500 || offset.y > windowHeight * 0.3) {
        mediumTap();
        onClose();
        return;
      }

      // Fast swipe up - expand
      if (velocity.y < -500) {
        currentSnapIndex.current = snapPoints.length - 1;
        lightTap();
        return;
      }

      // Find closest snap point
      const currentY = getSnapY(currentSnapIndex.current) + offset.y;
      let closestIndex = 0;
      let closestDistance = Infinity;

      snapPoints.forEach((_, index) => {
        const snapY = getSnapY(index);
        const distance = Math.abs(currentY - snapY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== currentSnapIndex.current) {
        lightTap();
      }
      currentSnapIndex.current = closestIndex;
    },
    [snapPoints, getSnapY, onClose, lightTap, mediumTap]
  );

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset snap index when opening
  useEffect(() => {
    if (isOpen) {
      currentSnapIndex.current = initialSnap;
    }
  }, [isOpen, initialSnap]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: `${(1 - snapPoints[initialSnap]) * 100}%` }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{
              top: getSnapY(snapPoints.length - 1),
              bottom: 0,
            }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={`fixed left-0 right-0 bottom-0 z-50 bg-slate-900 rounded-t-3xl overflow-hidden ${className}`}
            style={{
              height: `${snapPoints[snapPoints.length - 1] * 100}%`,
              maxHeight: '95vh',
            }}
          >
            {/* Handle */}
            {showHandle && (
              <div
                className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-12 h-1.5 rounded-full bg-slate-600" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                {title && (
                  <h2 className="text-lg font-bold text-white">{title}</h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 rounded-full hover:bg-slate-800 transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto h-full pb-safe">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Simple confirmation bottom sheet
interface ConfirmSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmSheet({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'primary',
}: ConfirmSheetProps) {
  const { mediumTap } = useHaptics();

  const handleConfirm = () => {
    mediumTap();
    onConfirm();
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.35]}
      showCloseButton={false}
    >
      <div className="p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
          >
            {cancelText}
          </button>
          <motion.button
            onClick={handleConfirm}
            className={`flex-1 py-3 px-4 rounded-xl text-white font-semibold ${
              variant === 'danger'
                ? 'bg-[#FF5252] hover:bg-[#FF1744]'
                : ''
            }`}
            style={
              variant === 'primary'
                ? {
                    background:
                      'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
                  }
                : {}
            }
            whileTap={{ scale: 0.98 }}
          >
            {confirmText}
          </motion.button>
        </div>
      </div>
    </BottomSheet>
  );
}
