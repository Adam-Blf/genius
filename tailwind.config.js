/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Elephant blue palette
        ink: '#0A0E1A',
        surface: '#111826',
        surface2: '#1A2235',
        line: 'rgba(148,177,210,0.12)',
        // Elephant · desaturated blue-grey
        elephant: {
          50: '#E9F0F8',
          100: '#C7D6E9',
          200: '#9EB9D6',
          300: '#7AAAD4',
          400: '#5A8DBC',
          500: '#4A7FB5', // primary
          600: '#2C5A8B',
          700: '#1E4068',
          800: '#15304F',
          900: '#0D1E34',
        },
        tusk: '#F5ECD8', // ivory accent
        sun: '#FFB84D',  // warm complement
        blaze: '#E05858',
        leaf: '#6AB07A',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'btn-elephant': '0 4px 0 #2C5A8B',
        'btn-sun': '0 4px 0 #B98325',
        'btn-blaze': '0 4px 0 #8F3A3A',
        'btn-leaf': '0 4px 0 #3F7A4E',
        'soft': '0 1px 2px rgba(0,0,0,0.3)',
        'pop': '0 8px 24px rgba(74,127,181,0.25)',
      },
    },
  },
  plugins: [],
}
