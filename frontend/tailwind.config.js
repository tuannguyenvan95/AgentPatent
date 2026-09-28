/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#070A11',         // Deep Graphite Void
          panel: '#0A0E17',      // Primary Station Panel
          card: '#0F1523',       // Tactical Card Surface
          cardHover: '#141C2E',
          border: '#1A2338',     // Subtle Circuit Border
          borderBright: '#2A3B5C',
          cyan: '#06B6D4',       // Holographic Telemetry
          cyanGlow: '#22D3EE',
          teal: '#14B8A6',       // Verified Novelty
          tealGlow: '#2DD4BF',
          emerald: '#10B981',
          crimson: '#F43F5E',    // Prior Art Collision Alert
          crimsonGlow: '#FB7185',
          amber: '#F59E0B',      // Inquest / Sub Judice
          purple: '#A855F7',     // Safety Escalation
          textDim: '#64748B',
          textMuted: '#94A3B8',
          textBright: '#F1F5F9',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 25px -4px rgba(6, 182, 212, 0.35)',
        'teal-glow': '0 0 25px -4px rgba(20, 184, 166, 0.35)',
        'crimson-glow': '0 0 25px -4px rgba(244, 63, 94, 0.35)',
        'amber-glow': '0 0 25px -4px rgba(245, 158, 11, 0.35)',
        'panel-border': '0 0 0 1px rgba(26, 35, 56, 1), 0 8px 30px -8px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'radar-sweep': 'sweep 4s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
