/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        academic: {
          bg: '#F9FAFB',
          card: '#FFFFFF',
          border: '#E2E8F0',
          darkborder: '#1E293B',
          navy: '#0F172A',
          slate: '#334155',
          muted: '#64748B',
          teal: '#0D9488',
          tealLight: '#F0FDFA',
          crimson: '#E11D48',
          crimsonLight: '#FFF1F2',
          amber: '#D97706',
          amberLight: '#FFFBEB',
          purple: '#6366F1',
          purpleLight: '#EEF2FF',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
