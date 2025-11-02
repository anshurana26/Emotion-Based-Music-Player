/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d8f0ff',
          200: '#b6e2ff',
          300: '#86cdff',
          400: '#49b0ff',
          500: '#1e96f9',
          600: '#0d78d6',
          700: '#0b60ad',
          800: '#0e528c',
          900: '#0f4471',
        },
        surface: {
          50: '#f7f8fb',
          100: '#eef1f6',
          800: '#151923',
          900: '#0f131b',
        },
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
    },
  },
  plugins: [],
};