// src/middleware/authorize.js
import ApiError from "../utils/ApiError.js";

// Middleware للتحقق مما إذا كان المستخدم لديه أي من الأدوار المحددة
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // نفترض أن authenticate.js قد أضاف req.user وبه req.user.roles
    if (!req.user || !req.user.roles) {
      return next(
        new ApiError(401, "User not authenticated or roles not found")
      );
    }

    const userRoles = req.user.roles; // مثال: ['USER', 'HR_MANAGER']
    const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      return next(
        new ApiError(
          403,
          "Forbidden: You do not have permission to access this resource"
        )
      );
    }
    next(); // المستخدم لديه الصلاحية، انتقل للمعالج التالي
  };
};

// (اختياري) Middleware للتحقق من صلاحية محددة (إذا كان لديك نظام صلاحيات دقيق)
// export const authorizePermission = (requiredPermission) => {
//   return (req, res, next) => {
//     // هنا ستحتاج إلى جلب صلاحيات المستخدم (قد تكون مخزنة مع الأدوار أو في جدول منفصل)
//     // const userPermissions = req.user.permissions; // افترض أن لديك هذا
//     // if (!userPermissions || !userPermissions.includes(requiredPermission)) {
//     //   return next(new ApiError(403, 'Forbidden: Missing required permission'));
//     // }
//     next();
//   };
// };
