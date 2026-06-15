import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.github.chartmann1590.partyquips',
  appName: 'Party Quips',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      clientId: '582819634867-l7716hit5r0s0reho7l881g5ee5lkmf4.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
  android: {
    backgroundColor: '#0f0f1a',
  },
}

export default config
