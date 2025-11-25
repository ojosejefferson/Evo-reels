/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'evo-primary': '#ff00c3',
        'evo-secondary': '#00f2ff',
      },
    },
  },
  plugins: [],
}
