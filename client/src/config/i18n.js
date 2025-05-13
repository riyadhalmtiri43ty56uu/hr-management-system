// src/config/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend'; // لتحميل الترجمات من الخادم/public
import LanguageDetector from 'i18next-browser-languagedetector'; // لاكتشاف لغة المتصفح

i18n
  // لتحميل ملفات الترجمة (من مجلد public/locales)
  .use(HttpApi)
  // لاكتشاف لغة المستخدم (من localStorage, navigator, ...)
  .use(LanguageDetector)
  // لتمرير instance i18n إلى react-i18next
  .use(initReactI18next)
  // تهيئة i18next
  .init({
    // اللغة الافتراضية إذا لم يتم اكتشاف لغة أو لم يكن ملف الترجمة متاحًا
    fallbackLng: 'en',
    // اللغات المدعومة (اختياري ولكن جيد للتوضيح)
    supportedLngs: ['en', 'ar'],
    // تفعيل وضع التصحيح (debug) في الكونسول أثناء التطوير
    debug: import.meta.env.DEV, // تفعيل فقط في وضع التطوير

    // إعدادات اكتشاف اللغة
    detection: {
      // ترتيب طرق الاكتشاف: localStorage أولاً، ثم لغة المتصفح
      order: ['localStorage', 'navigator'],
      // اسم المفتاح المستخدم في localStorage لتخزين اللغة المختارة
      lookupLocalStorage: 'language',
      // ذاكرة التخزين المؤقت للغة المكتشفة (localStorage هو الافتراضي)
      caches: ['localStorage'],
    },

    // إعدادات backend لتحميل ملفات الترجمة
    backend: {
      // المسار إلى ملفات الترجمة (نسبة إلى مجلد public)
      // {{lng}} سيتم استبدالها برمز اللغة (مثل 'en' أو 'ar')
      loadPath: '/locales/{{lng}}.json',
    },

    // إعدادات react-i18next
    react: {
      // استخدام Suspense أثناء تحميل الترجمات (مهم!)
      useSuspense: true,
    },

    // كيفية التعامل مع الـ interpolation (مثل {{name}} في ملفات الترجمة)
    interpolation: {
      escapeValue: false, // ليس ضروريًا لـ React لأنه يقوم بالـ escaping افتراضيًا
    },
  });

export default i18n;