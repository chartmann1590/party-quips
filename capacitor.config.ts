import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.github.chartmann1590.partyquips',
  appName: 'Party Quips',
  webDir: 'dist',
  server: {
    // Load the live GitHub Pages site so updates auto-deploy without rebuilding the APK
    url: 'https://chartmann1590.github.io/party-quips/',
    cleartext: false,
  },
  android: {
    backgroundColor: '#0f0f1a',
  },
}

export default config
