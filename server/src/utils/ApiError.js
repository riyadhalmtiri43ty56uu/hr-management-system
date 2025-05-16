// src/utils/ApiError.js
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message); // استدعاء مُنشئ كلاس Error الأب
    this.statusCode = statusCode;
    this.data = null; // يمكنك إضافة بيانات إضافية هنا إذا لزم الأمر
    this.message = message;
    this.success = false; // بما أنه خطأ، فإنه ليس ناجحًا
    this.errors = errors; // مصفوفة من الأخطاء (مثل أخطاء التحقق من الصحة)

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// 👇 الطريقة الصحيحة للتصدير كـ default export
export default ApiError;