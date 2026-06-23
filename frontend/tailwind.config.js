/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: '#3d0c14',
          dark: '#2a0810',
          light: '#5a1420',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#e8cd6f',
          dark: '#b8941f',
        },
        cream: '#fdf8f0',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
