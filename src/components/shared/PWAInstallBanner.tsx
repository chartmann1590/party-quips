import { motion, AnimatePresence } from 'framer-motion'
import { usePWAInstall } from '../../hooks/usePWAInstall'

export default function PWAInstallBanner() {
  const { showInstallBanner, dismissBanner } = usePWAInstall()

  return (
    <AnimatePresence>
      {showInstallBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-sm mx-auto game-card neon-border flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-neon-purple text-lg">Add to Home Screen!</p>
                <p className="text-text-muted text-sm font-body mt-1">
                  Play Party Quips like an app — no browser bar, full screen fun!
                </p>
              </div>
              <button
                onClick={dismissBanner}
                className="text-text-muted text-2xl leading-none hover:text-text-primary transition-colors shrink-0"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-2 bg-game-bg rounded-xl p-3">
              <span className="text-2xl">1️⃣</span>
              <span className="text-text-primary text-sm font-body">Tap the Share button below <span className="text-neon-cyan">⬆️</span></span>
            </div>
            <div className="flex items-center gap-2 bg-game-bg rounded-xl p-3">
              <span className="text-2xl">2️⃣</span>
              <span className="text-text-primary text-sm font-body">Scroll and tap <span className="text-neon-cyan">"Add to Home Screen"</span></span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
