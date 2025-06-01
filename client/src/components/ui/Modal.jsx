// src/components/ui/Modal.jsx
import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa"; // أيقونة للإغلاق
import { useTranslation } from "react-i18next"; // للترجمة إذا احتجنا لأي نصوص داخل المودال

const Modal = ({
  isOpen, // (boolean) هل المودال مفتوح
  onClose, // (function) دالة تُستدعى عند طلب إغلاق المودال (بالضغط على زر الإغلاق أو الخلفية)
  title, // (string | ReactNode) عنوان المودال (يمكن أن يكون نصًا أو مكون React)
  children, // (ReactNode) محتوى المودال الرئيسي
  footerContent, // (ReactNode) (اختياري) محتوى لمنطقة التذييل (مثل أزرار الحفظ والإلغاء)
  size = "md", // (string) حجم المودال: 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full'
  closeOnOverlayClick = true, // (boolean) هل يتم إغلاق المودال عند النقر على الخلفية المعتمة
  showCloseButton = true, // (boolean) هل يتم عرض زر الإغلاق في الرأس
  bodyClassName = "", // (string) كلاسات إضافية لجسم المودال (الذي يحتوي على children)
  headerClassName = "", // (string) كلاسات إضافية لرأس المودال
  footerClassName = "", // (string) كلاسات إضافية لتذييل المودال
  dialogClassName = "", // (string) كلاسات إضافية للحاوية الرئيسية للمودال (التي تتحكم في العرض والمحاذاة)
  isSubmitting = false, // (boolean) (اختياري) لتعطيل زر الإغلاق أثناء الإرسال
}) => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const modalRef = useRef(null);

  // تأثير لإغلاق المودال عند الضغط على مفتاح Escape
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden"; // منع تمرير الصفحة الخلفية
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto"; // إعادة التمرير عند إغلاق المودال
    };
  }, [isOpen, onClose, isSubmitting]);

  // تأثير للتركيز على أول عنصر قابل للتركيز داخل المودال عند فتحه (للوصولية)
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null; // لا تعرض شيئًا إذا كان المودال مغلقًا

  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    "5xl": "sm:max-w-5xl",
    "6xl": "sm:max-w-6xl",
    "7xl": "sm:max-w-7xl",
    full: "sm:max-w-full h-full sm:h-auto", // يسمح بالارتفاع الكامل على الشاشات الصغيرة جدًا
  };

  const handleOverlayClick = () => {
    if (closeOnOverlayClick && !isSubmitting) {
      onClose();
    }
  };

  return (
    // --- 1. الخلفية المعتمة (Overlay) ---
    // fixed inset-0: يغطي الشاشة بأكملها
    // bg-slate-900/70: خلفية سوداء شفافة (أو رمادية داكنة) مع تأثير تعتيم
    // backdrop-blur-sm: تأثير ضبابي للخلفية (اختياري، يعطي مظهرًا زجاجيًا)
    // z-40: لضمان أن الخلفية فوق معظم العناصر الأخرى
    // flex items-center justify-center: لتوسيط محتوى المودال
    // p-4: مسافة بادئة حول المودال للسماح بالتمرير إذا كان المحتوى أطول من الشاشة
    // overflow-y-auto: يسمح بالتمرير الرأسي إذا كان المودال أطول من الشاشة
    <div
      className="fixed inset-0 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300 ease-in-out"
      onClick={handleOverlayClick}
      role="dialog" // للوصولية
      aria-modal="true" // للوصولية
      aria-labelledby={
        title && typeof title === "string" ? "modal-title" : undefined
      } // للوصولية
    >
      {/* --- 2. حاوية المودال الفعلية --- */}
      {/*
        bg-white dark:bg-slate-800: لون الخلفية للمودال (يدعم الوضع الداكن)
        rounded-xl: حواف دائرية أكبر لمظهر أحدث
        shadow-2xl: ظل قوي وواضح
        transform transition-all duration-300 ease-out: تأثيرات انتقال عند الظهور/الاختفاء
        w-full: يأخذ العرض الكامل المتاح (يتم تقييده بـ max-w- من sizeClasses)
        overflow-hidden: لإخفاء أي محتوى يتجاوز الحواف الدائرية (مفيد إذا كان الرأس/التذييل لهما خلفيات مختلفة)
        max-h-[90vh]: حد أقصى لارتفاع المودال (90% من ارتفاع الشاشة) للسماح برؤية جزء من الخلفية
      */}
      <div
        ref={modalRef}
        className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl transform transition-all duration-300 ease-out 
                   w-full m-auto overflow-hidden max-h-[90vh] flex flex-col
                   ${sizeClasses[size] || sizeClasses.md} ${dialogClassName}`}
        onClick={(e) => e.stopPropagation()} // منع إغلاق المودال عند النقر على محتواه الداخلي
        role="document" // للوصولية
      >
        {/* --- 2.1. رأس المودال (Header) --- */}
        {/*
          يحتوي على العنوان وزر الإغلاق.
          يتم عرضه فقط إذا كان هناك `title` أو `showCloseButton` هو true.
          flex items-center justify-between: لتوزيع العنوان وزر الإغلاق على الأطراف.
          p-4 sm:p-6: مسافات بادئة.
          border-b border-slate-200 dark:border-slate-700: خط فاصل سفلي.
        */}
        {(title || showCloseButton) && (
          <div
            className={`flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 ${headerClassName}`}
          >
            {title &&
              // إذا كان العنوان نصًا، استخدم h2. إذا كان مكون React، اعرضه كما هو.
              (typeof title === "string" ? (
                <h2
                  id="modal-title"
                  className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100"
                >
                  {title}
                </h2>
              ) : (
                title // لعرض مكون React كعنوان
              ))}
            {showCloseButton && (
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className={`p-1.5 rounded-full text-slate-400 dark:text-slate-500 
                            hover:bg-slate-200 dark:hover:bg-slate-700 
                            hover:text-slate-600 dark:hover:text-slate-300
                            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${dir === "rtl" ? "mr-auto" : "ml-auto"}`} // لدفع الزر إلى الحافة المقابلة للعنوان
                aria-label={t("close", { defaultValue: "Close" })} // للوصولية (أضف "close" للترجمة)
              >
                <FaTimes size={18} />
              </button>
            )}
          </div>
        )}

        {/* --- 2.2. جسم المودال (Body/Content) --- */}
        {/*
          يحتوي على المحتوى الرئيسي للمودال (`children`).
          p-4 sm:p-6: مسافات بادئة.
          overflow-y-auto: يسمح بالتمرير الرأسي إذا كان المحتوى أطول من المساحة المتاحة.
        */}
        <div
          className={`p-4 sm:p-6 overflow-y-auto flex-grow ${bodyClassName}`}
        >
          {children}
        </div>

        {/* --- 2.3. تذييل المودال (Footer) --- */}
        {/*
          يحتوي على الأزرار أو أي محتوى إضافي للتذييل.
          يتم عرضه فقط إذا كان `footerContent` موجودًا.
          flex justify-end: لمحاذاة الأزرار إلى اليمين (أو اليسار في RTL).
          space-x-3: مسافة بين الأزرار.
          p-4 sm:p-5: مسافات بادئة.
          bg-slate-50 dark:bg-slate-800/50: خلفية خفيفة للتذييل (لتمييزه عن الجسم).
          border-t border-slate-200 dark:border-slate-700: خط فاصل علوي.
        */}
        {footerContent && (
          <div
            className={`flex ${
              dir === "rtl"
                ? "justify-start space-x-reverse space-x-3"
                : "justify-end space-x-3"
            } 
                           p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 
                           ${footerClassName}`}
          >
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
