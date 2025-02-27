/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/app/**/*.{js,ts,jsx,tsx}",
      "./src/pages/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        colors: {
          orange: {
            50: '#fff8f1',
            100: '#feecdc',
            200: '#fcd9bd',
            300: '#fdba8c',
            400: '#ff8a4c',
            500: '#ff5a1f',
            600: '#d03801',
            700: '#b43403',
            800: '#8a2c0d',
            900: '#771d1d',
          },
        },
        boxShadow: {
          soft: '0 2px 15px 0 rgba(0, 0, 0, 0.05)',
        },
      },
    },
    safelist: [
      'bg-white',
      'text-black',
      'text-gray-500',
      'text-gray-600',
      'text-gray-700',
      'text-gray-800',
      'text-gray-900',
      'bg-gray-100',
      'bg-gray-200',
      'border-gray-100',
      'border-gray-200',
      'bg-orange-50',
      'bg-orange-100',
      'bg-orange-500',
      'bg-orange-600',
      'border-orange-100',
      'border-orange-200',
      'text-orange-600',
      'text-white',
      'hover:bg-orange-100',
      'hover:bg-orange-600',
      'hover:bg-gray-200'
    ],
    plugins: [],
  };