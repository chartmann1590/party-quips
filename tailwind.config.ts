import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Party Quips design system (Stitch-generated)
        'pq-bg': '#1c1014',
        'pq-surface': '#291c21',
        'pq-surface-high': '#34262b',
        'pq-border': '#574048',
        'pq-pink': '#ec4899',
        'pq-pink-light': '#ffb0cd',
        'pq-pink-container': '#f751a1',
        'pq-violet': '#a855f7',
        'pq-lavender': '#e0b6ff',
        'pq-yellow': '#facc15',
        'pq-green': '#4ade80',
        'pq-cyan': '#06b6d4',
        'pq-text': '#f5dce3',
        'pq-muted': '#debec8',
        'pq-error': '#ffb4ab',
        // Legacy aliases (game pages use these — values updated to new palette)
        'game-bg': '#1c1014',
        'game-surface': '#291c21',
        'game-border': '#574048',
        'neon-purple': '#a855f7',
        'neon-purple-light': '#c084fc',
        'neon-cyan': '#06b6d4',
        'neon-yellow': '#facc15',
        'neon-pink': '#ec4899',
        'neon-green': '#4ade80',
        'neon-orange': '#fb923c',
        'text-primary': '#f5dce3',
        'text-muted': '#debec8',
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
        'pq-gradient': 'linear-gradient(135deg, #1c1014 0%, #3d0066 55%, #880e4f 100%)',
        'pq-gradient-phone': 'linear-gradient(160deg, #2d0a4e 0%, #1c1014 45%, #6b0f3a 100%)',
        'pq-pink-gradient': 'linear-gradient(135deg, #ec4899, #f751a1)',
        // Legacy
        'neon-gradient': 'linear-gradient(135deg, #a855f7, #06b6d4)',
        'game-gradient': 'linear-gradient(180deg, #1c1014 0%, #3d0066 100%)',
        'card-gradient': 'linear-gradient(135deg, #291c21, #3d1a3a)',
        'quiplash-gradient': 'linear-gradient(135deg, #4c1d95, #7c3aed)',
        'fibbage-gradient': 'linear-gradient(135deg, #7c2d12, #ea580c)',
        'trivia-gradient': 'linear-gradient(135deg, #831843, #ec4899)',
      },
    },
  },
  plugins: [],
} satisfies Config
