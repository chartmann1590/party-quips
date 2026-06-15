import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.github.chartmann1590.partyquips',
  appName: 'Party Quips',
  webDir: 'dist',
  server: {
    url: 'https://chartmann1590.github.io/party-quips/',
    cleartext: false,
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      // Web client ID — used as serverClientId so the ID token is issued for our server
      serverClientId: '582819634867-l7716hit5r0s0reho7l881g5ee5lkmf4.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
  android: {
    backgroundColor: '#0f0f1a',
  },
}

export default config
