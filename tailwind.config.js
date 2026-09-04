// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#0C1228',
          900: '#101935', // Main page background
          850: '#141F42',
          800: '#1A264F', // Primary Card surface
          750: '#1E2D5C', // Elevated Card / Hover
          700: '#24356B', // Subtle border / track
          600: '#2E4282',
        },
        cyanAccent: {
          DEFAULT: '#00D2FF',
          hover: '#38BDF8',
          glow: 'rgba(0, 210, 255, 0.25)',
        },
        goldAccent: {
          DEFAULT: '#FFB020',
          hover: '#F59E0B',
          glow: 'rgba(255, 176, 32, 0.25)',
        },
        brand: {
          primary: '#00D2FF',
          secondary: '#1A264F',
          accent: '#FFB020',
        },
        background: {
          DEFAULT: '#F8FAFC',
          dark: '#101935',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1A264F',
        },
        status: {
          success: '#10B981',
          warning: '#FFB020',
          error: '#EF4444',
          info: '#00D2FF',
          disabled: '#64748B',
        },
        text: {
          primary: '#111827',
          secondary: '#2A2F38',
          light: '#F1F5F9',
          muted: '#8E9EB8',
          gold: '#FFB020',
        },
      },
      borderRadius: {
        'card': '22px',
        'soft': '20px',
      },
      boxShadow: {
        'soft-navy': '0 12px 32px rgba(7, 11, 26, 0.5)',
        'soft-navy-lg': '0 20px 48px rgba(7, 11, 26, 0.65)',
        'glow-cyan': '0 0 16px rgba(0, 210, 255, 0.3)',
        'glow-gold': '0 0 16px rgba(255, 176, 32, 0.3)',
      },
      animation: {
        'shine': 'shine 3s linear infinite',
      },
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%) rotate(25deg)' },
          '100%': { transform: 'translateX(200%) rotate(25deg)' },
        },
      },
    },
  },
  plugins: [],
}