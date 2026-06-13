import { useEffect, useState } from 'react'

interface PWAInstallState {
  isIOS: boolean
  isStandalone: boolean
  showInstallBanner: boolean
  dismissBanner: () => void
}

const DISMISSED_KEY = 'pq_pwa_dismissed'

export function usePWAInstall(): PWAInstallState {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true

  const [showInstallBanner, setShowInstallBanner] = useState(
    isIOS && !isStandalone && !localStorage.getItem(DISMISSED_KEY)
  )

  function dismissBanner() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setShowInstallBanner(false)
  }

  return { isIOS, isStandalone, showInstallBanner, dismissBanner }
}
