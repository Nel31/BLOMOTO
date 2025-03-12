/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'primary': '#3865CA',
          'secondary': '#FF5733',
          'dark': '#1E293B',
        },
      },
    },
    plugins: [],
  }