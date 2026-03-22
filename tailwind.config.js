/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans KR"', 'sans-serif'],
      },
      colors: {
        lavender: {
          100: '#f0e6ff',
          200: '#d9b8ff',
          300: '#c285ff',
          400: '#ab52ff',
        },
        mint: {
          100: '#e0faf4',
          200: '#b3f0e0',
          300: '#70dfc4',
        },
      },
    },
  },
  plugins: [],
};
