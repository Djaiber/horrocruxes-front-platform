/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        hp: {
          dark:    '#09090f',
          surface: '#111120',
          raised:  '#1a1a2e',
          border:  '#2a2a4a',
          gold:    '#d4af37',
          'gold-light': '#f0d060',
          crimson: '#740001',
          'crimson-light': '#ae0001',
          parchment: '#f5e6c8',
          muted:   '#6b7280',
        },
      },
      fontFamily: {
        heading: ['"Cinzel"', 'serif'],
        body:    ['"Inter"', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'fade-in':   'fadeIn 0.3s ease-in-out',
        'slide-up':  'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
