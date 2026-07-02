/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'vt323': ['"VT323"', 'monospace'],
        'mono': ['"Space Mono"', 'monospace'],
        'geist': ['Geist', 'sans-serif'],
        'instrument': ['"Instrument Serif"', 'serif'],
      }
    },
  },
  plugins: [],
}

