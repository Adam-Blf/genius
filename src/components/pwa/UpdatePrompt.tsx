import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('[PWA] Service Worker registered:', registration);

      // Check for updates every 30 minutes
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration error:', error);
    },
    onNeedRefresh() {
      setShowPrompt(true);
    },
    onOfflineReady() {
      console.log('[PWA] App ready for offline use');
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
    setShowPrompt(false);
    setNeedRefresh(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Show again in 1 hour
    setTimeout(() => {
      if (needRefresh) {
        setShowPrompt(true);
      }
    }, 60 * 60 * 1000);
  };

  return (
    <AnimatePresence>
      {showPrompt && needRefresh && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[60] safe-area-top"
        >
          <div
            className="px-4 py-3"
            style={{
              background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
            }}
          >
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Sparkles className="w-5 h-5 text-[#00E5FF]" />
                </motion.div>
                <span className="text-white text-sm font-medium">
                  Nouvelle version disponible !
                </span>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleUpdate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#0052D4] text-sm font-semibold"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Mettre a jour
                </motion.button>

                <button
                  onClick={handleDismiss}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manually check for updates
export function useCheckForUpdates() {
  const [checking, setChecking] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);

  const checkForUpdates = async () => {
    if ('serviceWorker' in navigator) {
      setChecking(true);
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          // Check if there's a waiting worker
          if (registration.waiting) {
            setHasUpdate(true);
          }
        }
      } catch (error) {
        console.error('[PWA] Update check failed:', error);
      } finally {
        setChecking(false);
      }
    }
  };

  const applyUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  return {
    checking,
    hasUpdate,
    checkForUpdates,
    applyUpdate,
  };
}
