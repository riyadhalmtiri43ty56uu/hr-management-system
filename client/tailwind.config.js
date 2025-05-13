// tailwind.config.js
// import scrollbar from 'tailwind-scrollbar';
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
  plugins: [
    import('tailwind-scrollbar') // استيراد كـ ES module
  ],
}