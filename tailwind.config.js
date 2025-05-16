/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        animation: {
          'float': 'float 6s ease-in-out infinite',
          'float-slow': 'float 8s ease-in-out infinite',
          'float-delayed': 'float 7s ease-in-out infinite',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-20px)' },
          }
        },
      },
    },
    plugins: [],
  }
