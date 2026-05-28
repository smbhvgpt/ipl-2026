/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0B0F19',
        ink: '#0F1422',
        slatex: '#1A2236',
        edge: '#252F47',
        neon: {
          cyan: '#22D3EE',
          violet: '#A78BFA',
          lime: '#A3E635',
          pink: '#F472B6',
          gold: '#FBBF24'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 24px rgba(34, 211, 238, 0.15)',
        neon: '0 0 32px rgba(167, 139, 250, 0.25)'
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' }
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' }
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      },
      animation: {
        pulseSlow: 'pulseSlow 2.5s ease-in-out infinite',
        scan: 'scan 3s linear infinite',
        floaty: 'floaty 4s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
