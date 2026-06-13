import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Party Quips design system — bright & fun
        'pq-bg': '#2e1065',
        'pq-surface': '#3730a3',
        'pq-surface-high': '#4c3ab5',
        'pq-border': '#6d5fdb',
        'pq-pink': '#f472b6',
        'pq-pink-light': '#fbcfe8',
        'pq-pink-container': '#ec4899',
        'pq-violet': '#a78bfa',
        'pq-lavender': '#e9d5ff',
        'pq-yellow': '#fde047',
        'pq-yellow-dark': '#ca8a04',
        'pq-green': '#4ade80',
        'pq-cyan': '#06b6d4',
        'pq-orange': '#ea580c',
        'pq-red': '#dc2626',
        'pq-text': '#ffffff',
        'pq-muted': '#c7d2fe',
        'pq-error': '#fca5a5',
        // Legacy aliases
        'game-bg': '#2e1065',
        'game-surface': '#3730a3',
        'game-border': '#6d5fdb',
        'neon-purple': '#a78bfa',
        'neon-purple-light': '#c4b5fd',
        'neon-cyan': '#06b6d4',
        'neon-yellow': '#fde047',
        'neon-pink': '#f472b6',
        'neon-green': '#4ade80',
        'neon-orange': '#ea580c',
        'text-primary': '#ffffff',
        'text-muted': '#c7d2fe',
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Bricolage Grotesque', 'sans-serif'],
        label: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-pink': 'pulsePink 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'score-pop': 'scorePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'dots': 'dots 1.4s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(168, 85, 247, 0.8), 0 0 80px rgba(168, 85, 247, 0.3)' },
        },
        pulsePink: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.4), 0 4px 20px rgba(236, 72, 153, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.8), 0 4px 30px rgba(236, 72, 153, 0.5)' },
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
        dots: {
          '0%, 80%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '40%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'pq-gradient': 'linear-gradient(135deg, #3730a3 0%, #2e1065 60%, #1e1b4b 100%)',
        'pq-gradient-phone': 'linear-gradient(160deg, #4c1d95 0%, #2e1065 60%, #1e1b4b 100%)',
        'pq-pink-gradient': 'linear-gradient(135deg, #f472b6, #ec4899)',
        // Legacy
        'neon-gradient': 'linear-gradient(135deg, #a78bfa, #06b6d4)',
        'game-gradient': 'linear-gradient(180deg, #2e1065 0%, #1e1b4b 100%)',
        'card-gradient': 'linear-gradient(135deg, #3730a3, #2e1065)',
        'quiplash-gradient': 'linear-gradient(135deg, #0891b2, #06b6d4)',
        'fibbage-gradient': 'linear-gradient(135deg, #c2410c, #ea580c)',
        'trivia-gradient': 'linear-gradient(135deg, #b91c1c, #dc2626)',
      },
    },
  },
  plugins: [],
} satisfies Config
