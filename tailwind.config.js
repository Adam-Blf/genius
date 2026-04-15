/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0F1A',
        surface: '#121826',
        line: 'rgba(255,255,255,0.08)',
        grass: '#58CC02',
        grass2: '#46A302',
        sun: '#FFC800',
        blaze: '#FF4B4B',
        mint: '#1CB0F6',
        plum: '#CE82FF',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'btn-grass': '0 4px 0 #2E7D00',
        'btn-sun': '0 4px 0 #B98A00',
        'btn-blaze': '0 4px 0 #B43232',
        'btn-mint': '0 4px 0 #0E7AAC',
        'soft': '0 1px 2px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
