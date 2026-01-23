import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, CloudOff } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline, wasOffline, effectiveType } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Show "back online" message when reconnecting
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  useEffect(() => {
    // Detect slow connection
    setIsSlowConnection(effectiveType === 'slow-2g' || effectiveType === '2g');
  }, [effectiveType]);

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50 safe-area-top"
          >
            <div className="bg-gradient-to-r from-[#FF5252] to-[#FF1744] px-4 py-3">
              <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <WifiOff className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-white text-sm font-medium">
                  Mode hors-ligne - Les donnees sont sauvegardees localement
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Online Banner */}
      <AnimatePresence>
        {showReconnected && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50 safe-area-top"
          >
            <div
              className="px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
              }}
            >
              <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  <Wifi className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-white text-sm font-medium">
                  Connexion retablie !
                </span>
                <motion.button
                  onClick={() => window.location.reload()}
                  className="ml-2 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slow Connection Warning */}
      <AnimatePresence>
        {isOnline && isSlowConnection && !showReconnected && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50 safe-area-top"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2">
              <div className="flex items-center justify-center gap-2 max-w-lg mx-auto">
                <CloudOff className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">
                  Connexion lente - Mode economie active
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Compact version for embedding in header
export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#FF5252]/20 border border-[#FF5252]/30"
    >
      <WifiOff className="w-3 h-3 text-[#FF5252]" />
      <span className="text-[#FF5252] text-xs font-medium">Offline</span>
    </motion.div>
  );
}
