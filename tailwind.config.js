/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B1120',
          card: '#111827',
          sidebar: '#0F172A',
          hover: '#1A2333',
        },
        border: {
          DEFAULT: '#1F2937',
          light: '#2A3647',
        },
        primary: {
          DEFAULT: '#8B5CF6',
          50: '#F3EEFF',
          100: '#E5D9FF',
          200: '#CBB2FF',
          300: '#AC85FF',
          400: '#9761F9',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        secondary: {
          DEFAULT: '#F97316',
          light: '#FB923C',
          dark: '#EA580C',
        },
        success: {
          DEFAULT: '#22C55E',
          light: '#4ADE80',
          bg: 'rgba(34,197,94,0.12)',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          bg: 'rgba(239,68,68,0.12)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          bg: 'rgba(245,158,11,0.12)',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          bg: 'rgba(59,130,246,0.12)',
        },
        txt: {
          DEFAULT: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Cairo', 'sans-serif'],
        body: ['"Inter"', 'Cairo', 'sans-serif'],
        arabic: ['"Cairo"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(0,0,0,0.35)',
        card: '0 2px 12px -2px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.02)',
        lift: '0 12px 32px -8px rgba(0,0,0,0.45)',
        glow: '0 0 0 1px rgba(139,92,246,0.4), 0 0 24px -4px rgba(139,92,246,0.35)',
        'glow-orange': '0 0 0 1px rgba(249,115,22,0.4), 0 0 24px -4px rgba(249,115,22,0.35)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        70: '17.5rem',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-700px 0' }, '100%': { backgroundPosition: '700px 0' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideUp: 'slideUp 0.35s ease-out',
        shimmer: 'shimmer 1.6s infinite linear',
        floaty: 'floaty 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
