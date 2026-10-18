/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C5A059',
          50: '#FBF8F1',
          100: '#F6EFE0',
          200: '#ECDEC2',
          300: '#DFC89E',
          400: '#D1B175',
          500: '#C5A059',
          600: '#B38E46',
          700: '#9A7836',
          800: '#7B5E2B',
          900: '#5F4620',
          hover: '#B38E46',
          light: 'rgba(197, 160, 89, 0.1)',
        },
        platinum: {
          DEFAULT: '#8E95A5',
          50: '#F7F8FA',
          100: '#EEF0F3',
          200: '#DCE0E6',
          300: '#C5CBD6',
          400: '#A9B1C0',
          500: '#8E95A5',
          600: '#72798B',
          700: '#585E6E',
          800: '#404552',
          900: '#2A2E37',
        },
        charcoal: {
          DEFAULT: '#16181B',
          soft: '#22262C',
          muted: '#6B7280',
          dark: '#0E1012',
        },
        alabaster: {
          DEFAULT: '#FAFAFB',
          pure: '#FFFFFF',
          card: '#FFFFFF',
          alt: '#F4F5F7',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Cinzel', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 35px -5px rgba(197, 160, 89, 0.25)',
        'glow-gold-sm': '0 0 15px -3px rgba(197, 160, 89, 0.2)',
        'glow-platinum': '0 0 30px -5px rgba(142, 149, 165, 0.2)',
        'luxury-card': '0 10px 40px -10px rgba(22, 24, 27, 0.05), 0 2px 10px -2px rgba(197, 160, 89, 0.05)',
        'luxury-card-hover': '0 20px 50px -12px rgba(22, 24, 27, 0.1), 0 0 25px -2px rgba(197, 160, 89, 0.18)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
