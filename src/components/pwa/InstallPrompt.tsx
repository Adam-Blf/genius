import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone
      || document.referrer.includes('android-app://');

    setIsStandalone(standalone);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user has dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedDate = dismissed ? new Date(dismissed) : null;
      const daysSinceDismissed = dismissedDate
        ? (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      // Show prompt if not dismissed or dismissed more than 7 days ago
      if (!dismissed || daysSinceDismissed > 7) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS prompt after delay if on iOS and not standalone
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem('pwa-install-dismissed-ios');
      const dismissedDate = dismissed ? new Date(dismissed) : null;
      const daysSinceDismissed = dismissedDate
        ? (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      if (!dismissed || daysSinceDismissed > 7) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const key = isIOS ? 'pwa-install-dismissed-ios' : 'pwa-install-dismissed';
    localStorage.setItem(key, new Date().toISOString());
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#4364F7]/30 bg-slate-900/95 backdrop-blur-xl shadow-2xl">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-[#0052D4] via-[#4364F7] to-[#6FB1FC] opacity-30" />

            <div className="relative p-4">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
                aria-label="Fermer"
              >
                <X size={16} className="text-slate-400" />
              </button>

              <div className="flex items-start gap-4">
                {/* Icon */}
                <motion.div
                  className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isIOS ? (
                    <Smartphone className="w-7 h-7 text-white" />
                  ) : (
                    <Download className="w-7 h-7 text-white" />
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 pr-6">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    Installe Genius
                    <Sparkles className="w-4 h-4 text-[#00E5FF]" />
                  </h3>

                  {isIOS ? (
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                      Appuie sur{' '}
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-700 rounded text-white text-xs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                      </span>
                      {' '}puis "Sur l'ecran d'accueil"
                    </p>
                  ) : (
                    <p className="text-slate-400 text-sm mt-1">
                      Acces rapide et experience optimisee !
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {!isIOS && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-2.5 px-4 rounded-xl text-slate-400 text-sm font-medium hover:bg-slate-800/50 transition-colors"
                  >
                    Plus tard
                  </button>
                  <motion.button
                    onClick={handleInstall}
                    className="flex-1 py-2.5 px-4 rounded-xl text-white text-sm font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    Installer
                  </motion.button>
                </div>
              )}

              {isIOS && (
                <button
                  onClick={handleDismiss}
                  className="w-full mt-4 py-2.5 px-4 rounded-xl text-slate-400 text-sm font-medium hover:bg-slate-800/50 transition-colors"
                >
                  J'ai compris
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
