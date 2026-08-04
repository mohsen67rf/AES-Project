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
        brand: {
          primary: '#C9A227',
          secondary: '#2A2F38',
          accent: '#00B8D9',
        },
        background: {
          DEFAULT: '#F4F6F8',
          dark: '#111827',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1F2937',
        },
        status: {
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
          info: '#3882F6',
          disabled: '#687280',
        },
        text: {
          primary: '#111827',
          secondary: '#2A2F38',
          light: '#F4F6F8',
          muted: '#687280',
          gold: '#C9A227',
        },
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