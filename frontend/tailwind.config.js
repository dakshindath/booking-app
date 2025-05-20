/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'airbnb-red': '#FF5A5F',
        'airbnb-pink': '#FF385C',
        'airbnb-dark-gray': '#484848',
        'airbnb-light-gray': '#767676',
        'airbnb-gray-border': '#DDDDDD',
        'airbnb-background': '#F7F7F7',
      },
      fontFamily: {
        'airbnb': ['Circular', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'airbnb': '12px',
      },
      boxShadow: {
        'airbnb': '0 6px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

