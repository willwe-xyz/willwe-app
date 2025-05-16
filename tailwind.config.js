const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Adelle Sans', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: '#1a1a1a',
        secondary: '#2d2d2d',
        accent: '#3d3d3d',
        background: '#0a0a0a',
        text: '#ffffff',
      },
    },
  },
  plugins: [],
};
