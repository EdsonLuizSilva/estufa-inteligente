/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shiver': 'shiver 0.75s ease-in-out infinite',
        'gentle-float': 'gentleFloat 3s ease-in-out infinite',
        'heat-throb': 'heatThrob 1.2s ease-in-out infinite',
        'heat-shake': 'heatShake 0.4s ease-in-out infinite',
      },
      keyframes: {
        shiver: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-1.5px) rotate(-0.5deg)' },
          '75%': { transform: 'translateX(1.5px) rotate(0.5deg)' },
        },
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        heatThrob: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
        heatShake: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1.04)' },
          '20%': { transform: 'translate(-2px, -1px) scale(1.07)' },
          '40%': { transform: 'translate(2px, 1px) scale(1.04)' },
          '60%': { transform: 'translate(-1px, 2px) scale(1.07)' },
          '80%': { transform: 'translate(1px, -2px) scale(1.04)' },
        },
      }
    },
  },
  plugins: [],
}
