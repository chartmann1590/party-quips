import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'game-bg': '#0f0f1a',
        'game-surface': '#1a1a2e',
        'game-border': '#2d2d4e',
        'neon-purple': '#b537f2',
        'neon-purple-light': '#d070ff',
        'neon-cyan': '#00f5ff',
        'neon-yellow': '#ffeb00',
        'neon-pink': '#ff2d78',
        'neon-green': '#39ff14',
        'neon-orange': '#ff8c00',
        'text-primary': '#f0f0ff',
        'text-muted': '#8888aa',
      },
      fontFamily: {
        display: ['Fredoka One', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'score-pop': 'scorePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(181, 55, 242, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(181, 55, 242, 0.8), 0 0 80px rgba(181, 55, 242, 0.3)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scorePop: {
          from: { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.2)' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          from: { transform: 'scale(0.3)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #b537f2, #00f5ff)',
        'game-gradient': 'linear-gradient(180deg, #0f0f1a 0%, #1a0a2e 100%)',
        'card-gradient': 'linear-gradient(135deg, #1a1a2e, #2d1a4e)',
        'quiplash-gradient': 'linear-gradient(135deg, #b537f2, #ff2d78)',
        'fibbage-gradient': 'linear-gradient(135deg, #ff8c00, #ffeb00)',
        'trivia-gradient': 'linear-gradient(135deg, #ff2d78, #8b0000)',
      },
    },
  },
  plugins: [],
} satisfies Config
