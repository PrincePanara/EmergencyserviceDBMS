/** @type {import('tailwindcss').Config} */
const token = (name) => ({ opacityValue }) =>
  opacityValue === undefined
    ? `rgb(var(--ers-${name}))`
    : `rgb(var(--ers-${name}) / ${opacityValue})`;

export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        canvas: token('bg'),
        surface: token('surface'),
        subtle: token('surface-2'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        primary: {
          DEFAULT: token('primary'),
          dark: token('primary-dark'),
          deep: token('primary-deep'),
          light: token('primary-light'),
        },
        success: { DEFAULT: token('success'), light: token('success-light') },
        warning: { DEFAULT: token('warning'), light: token('warning-light') },
        info: { DEFAULT: token('info'), light: token('info-light') },
        violet: { DEFAULT: token('violet'), light: token('violet-light') },
      },
      fontSize: {
        '2xs': ['11px', '16px'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04)',
        pop: '0 8px 24px -8px rgb(15 23 42 / 0.18)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgb(var(--ers-primary) / 0.35)' },
          '100%': { boxShadow: '0 0 0 8px rgb(var(--ers-primary) / 0)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};
