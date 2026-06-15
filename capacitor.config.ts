import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.github.chartmann1590.partyquips',
  appName: 'Party Quips',
  webDir: 'dist',
  server: {
    // Load the live GitHub Pages site so updates auto-deploy without rebuilding the APK
    url: 'https://chartmann1590.github.io/party-quips/',
    cleartext: false,
    // Keep Firebase auth redirect and Google OAuth inside the WebView so
    // sessionStorage and IndexedDB are shared throughout the redirect chain.
    // Without this, Capacitor opens these in Chrome Custom Tabs which don't
    // share storage with the WebView, causing signInWithRedirect to lose state.
    allowNavigation: [
      'party-quips-2026.firebaseapp.com',
      'accounts.google.com',
      '*.google.com',
    ],
  },
  android: {
    backgroundColor: '#0f0f1a',
  },
}

export default config
