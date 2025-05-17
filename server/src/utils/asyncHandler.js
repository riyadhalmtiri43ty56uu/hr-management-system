// src/utils/asyncHandler.js

// هذا هو "Higher-Order Function" (دالة تأخذ دالة كوسيط وتعيد دالة جديدة)
// الهدف منه هو تغليف معالجات المسارات (route handlers) التي تستخدم async/await
// لضمان أن أي أخطاء يتم التقاطها وتمريرها إلى middleware معالج الأخطاء المركزي (next(error)).
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// 👇 الطريقة الصحيحة للتصدير كـ default export
export default asyncHandler;