/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        court: {
          bg: '#080C18',          // Deepest Imperial Midnight
          panel: '#0E162B',       // Velvet Navy Dossier Panel
          card: '#121D38',        // Sovereign Blue Parchment Base
          border: '#233257',      // Midnight Slate Border
          goldBorder: '#C5A059',  // Burnished Antique Gold
          gold: '#E5C158',        // Regal Gold Accent
          goldMuted: '#9A7B38',   // Aged Brass
          parchment: '#F5EFE0',   // Antique Document Parchment
          parchmentDark: '#1E2C4F',// Deep Indigo Dossier
          burgundy: '#881326',    // Imperial Crimson Seal
          burgundyDark: '#500B17',// Deep Velvet Claret
          burgundyLight: '#A31B32',// Bright Velvet Red
          emerald: '#155E38',     // Decree Valid Green
          emeraldLight: '#228B52',// Bright Novelty Green
          amber: '#B45309',       // Hearing Yellow/Amber
          amberLight: '#D97706',
          textMuted: '#94A3B8',
          textLight: '#E2E8F0',
        }
      },
      fontFamily: {
        decorative: ['"Cinzel Decorative"', 'Cinzel', 'serif'],
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Courier Prime', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px -3px rgba(197, 160, 89, 0.25)',
        'burgundy-glow': '0 0 20px -3px rgba(136, 19, 38, 0.35)',
        'court-panel': '0 10px 30px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(197, 160, 89, 0.2)',
      }
    },
  },
  plugins: [],
}
