import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// TODO: swap to Google Play URL when the app is published there
const APP_DOWNLOAD_URL = 'https://github.com/chartmann1590/party-quips/releases/latest'
const STORAGE_KEY = 'pq-android-app-dismissed'

function isAndroidBrowser(): boolean {
  return (
    /android/i.test(navigator.userAgent) &&
    !window.matchMedia('(display-mode: standalone)').matches
  )
}

export default function AndroidAppBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isAndroidBrowser() && !localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-3"
        >
          <div
            className="max-w-sm mx-auto rounded-2xl flex items-center gap-3 px-4 py-3"
            style={{
              background: '#fde047',
              boxShadow: '0 -2px 20px rgba(0,0,0,0.2), 0 4px 0 #a16207',
            }}
          >
            <span className="text-2xl flex-none">🤖</span>

            <div className="flex-1 min-w-0">
              <p className="font-display font-black text-sm leading-tight" style={{ color: '#1e1b4b' }}>
                Get the Android App!
              </p>
              <p className="font-label text-xs leading-snug mt-0.5" style={{ color: '#78350f' }}>
                Download the APK for the full experience
              </p>
            </div>

            <a
              href={APP_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className="flex-none font-display font-black text-xs uppercase px-3 py-2 rounded-xl whitespace-nowrap"
              style={{
                background: '#1e1b4b',
                color: '#fde047',
                letterSpacing: '0.05em',
                boxShadow: '0 3px 0 #0d0b2e',
              }}
            >
              Download →
            </a>

            <button
              onClick={dismiss}
              className="flex-none w-7 h-7 rounded-full flex items-center justify-center font-black text-base leading-none"
              style={{ background: 'rgba(30,27,75,0.15)', color: '#1e1b4b' }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
