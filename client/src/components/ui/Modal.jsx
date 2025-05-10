// src/components/ui/Modal.jsx
import React from 'react';

const Modal = ({
  isOpen,     // Boolean: هل المودال مفتوح أم لا
  onClose,    // Function: دالة تُنفذ عند طلب إغلاق المودال
  title,      // String: عنوان المودال
  children,   // JSX: محتوى المودال
  size = 'md', // 'sm', 'md', 'lg', 'xl', 'full' لتحديد عرض المودال
  footerContent // JSX (optional): محتوى لمنطقة الـ footer (مثل أزرار الحفظ والإلغاء)
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full',
  };

  return (
    // الخلفية المعتمة
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // الإغلاق عند الضغط على الخلفية
    >
      {/* محتوى المودال */}
      <div
        className={`bg-white rounded-lg shadow-xl transform transition-all ${sizeClasses[size]} w-full mx-auto z-50 overflow-hidden`}
        onClick={(e) => e.stopPropagation()} // منع إغلاق المودال عند الضغط داخله
      >
        {/* رأس المودال */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* جسم المودال */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {/* تذييل المودال (اختياري) */}
        {footerContent && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-right space-x-2 space-x-reverse">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;