/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./assets/*.js"],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
      },
      colors: {
        accent: { DEFAULT: '#2563eb', dark: '#60a5fa' }
      }
    }
  },
  plugins: []
};