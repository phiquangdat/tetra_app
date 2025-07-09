/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#231942',
        secondary: '#998FC7',
        accent: '#FFA726',
        background: '#FFFFFF',
        cardBackground: '#F9F5FF',
        surface: '#14248A',
        highlight: '#D4C2FC',
      },
      fontFamily: {
        sans: ['system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      lineHeight: {
        base: '1.5',
      },
      fontWeight: {
        normal: '400',
      },
    },
  },
  plugins: [],
};
