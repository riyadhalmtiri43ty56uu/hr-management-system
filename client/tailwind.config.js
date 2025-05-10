// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <<<--- هذا هو الإعداد الحاسم
  theme: {
    extend: {},
  },
  plugins: [],
}