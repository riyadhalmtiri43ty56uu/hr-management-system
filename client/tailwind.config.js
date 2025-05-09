/** @type {import('tailwindcss').Config} */
export default { // إذا كنت تستخدم ES Modules (كما هو الحال مع Vite)
  // أو module.exports = { // إذا كنت تستخدم CommonJS (أقل شيوعًا مع Vite الجديد)
    content: [
      "./index.html", // ملف HTML الرئيسي
      "./src/**/*.{js,ts,jsx,tsx}", // جميع ملفات JavaScript/TypeScript و JSX/TSX داخل مجلد src
      // يمكنك إضافة مسارات أخرى إذا كانت لديك مكونات خارج src
      // مثال: "./public/**/*.html" إذا كان لديك HTML ثابت في public
    ],
    darkMode: 'class', // أو 'media' - 'class' هو الأكثر مرونة للتحكم اليدوي
    theme: {
      extend: {
        // هنا يمكنك إضافة تخصيصات للـ theme
        // مثل الألوان، الخطوط، نقاط التوقف (breakpoints)، إلخ.
        // مثال:
        // colors: {
        //   'brand-blue': '#1fb6ff',
        // },
        // fontFamily: {
        //   sans: ['Inter', 'sans-serif'],
        // },
      },
    },
    plugins: [
      // يمكنك إضافة إضافات Tailwind هنا
      // require('@tailwindcss/forms'),
      // require('@tailwindcss/typography'),
    ],
  }