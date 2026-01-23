/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Genius Blue Edition - Primary Gradient Colors
        primary: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#6FB1FC', // Sky
          400: '#4364F7', // Royal
          500: '#0052D4', // Deep Electric
          600: '#0047b8',
          700: '#003d9c',
          800: '#003280',
          900: '#002864',
          950: '#001d4d',
        },
        // Swipe Actions
        genius: {
          // Backgrounds
          bg: '#0F172A',        // Deep Slate (Dark Mode)
          'bg-light': '#F8F9FA', // Clean White (Light Mode)
          card: '#1e293b',
          border: '#334155',
          // Action Colors
          cyan: '#00E5FF',       // Cyan Neon - Swipe Right
          green: '#00C853',      // Alternative Green
          coral: '#FF5252',      // Soft Coral - Swipe Left
          // Gradient stops
          'grad-start': '#0052D4',  // Deep Electric
          'grad-mid': '#4364F7',    // Royal
          'grad-end': '#6FB1FC',    // Sky
        },
        // Legacy support
        secondary: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#6FB1FC',
          400: '#4364F7',
          500: '#0052D4',
          600: '#0047b8',
          700: '#003d9c',
          800: '#003280',
          900: '#002864',
          950: '#001d4d',
        },
        accent: {
          50: '#e0ffff',
          100: '#b3ffff',
          200: '#80ffff',
          300: '#4dffff',
          400: '#1affff',
          500: '#00E5FF', // Cyan Neon
          600: '#00b8cc',
          700: '#008a99',
          800: '#005c66',
          900: '#002e33',
          950: '#001a1d',
        },
      },
      // Blue-tinted box shadow for cards
      boxShadow: {
        'genius-card': '0 20px 40px -10px rgba(0, 82, 212, 0.15)',
        'genius-card-hover': '0 25px 50px -12px rgba(0, 82, 212, 0.25)',
        'genius-glow': '0 0 30px rgba(0, 229, 255, 0.3)',
        'nope-glow': '0 0 30px rgba(255, 82, 82, 0.3)',
        'fab': '0 4px 14px rgba(0, 82, 212, 0.25)',
        'fab-hover': '0 6px 20px rgba(0, 82, 212, 0.35)',
      },
      // Border radius for cards
      borderRadius: {
        'card': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-ralph': 'bounceRalph 0.6s ease-in-out',
        'confetti-burst': 'confettiBurst 1s ease-out forwards',
        'shake-wrong': 'shakeWrong 0.5s ease-in-out',
        'pulse-heart': 'pulseHeart 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        bounceRalph: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        confettiBurst: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        shakeWrong: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
        pulseHeart: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
