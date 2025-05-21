/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'staynest-red': '#FF5A5F',
        'staynest-pink': '#FF385C',
        'staynest-dark-gray': '#484848',
        'staynest-light-gray': '#767676',
        'staynest-gray-border': '#DDDDDD',
        'staynest-background': '#F7F7F7',
      },
      fontFamily: {
        'staynest': ['Circular', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'staynest': '12px',
      },
      boxShadow: {
        'staynest': '0 6px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

