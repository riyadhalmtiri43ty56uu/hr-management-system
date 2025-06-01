// src/middleware/authenticate.js
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwtUtils.js"; //  <-- ✅ استخدام الدالة المحدثة
import prisma from "../config/prismaClient.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new ApiError(401, "Unauthorized: No token provided or malformed token")
      );
    }

    const token = authHeader.split(" ")[1];
    // ✅ استخدام دالة التحقق الجديدة
    const decodedPayload = verifyAccessToken(token);

    // verifyAccessToken سترجع null إذا كان التوكن غير صالح أو منتهي الصلاحية
    // ويمكنها أيضًا رمي أخطاء مثل TokenExpiredError, JsonWebTokenError إذا لم يتم التعامل معها داخل verifyAccessToken
    if (!decodedPayload || !decodedPayload.userId) {
      // إذا كان verifyAccessToken يعيد null للأخطاء التي تم التعامل معها داخله
      return next(new ApiError(401, "Unauthorized: Invalid or expired token"));
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedPayload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        roles: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return next(
        new ApiError(401, "Unauthorized: User not found or not active")
      );
    }

    req.user = user;
    next();
  } catch (error) {
    // إذا كان verifyAccessToken يرمي الأخطاء بدلاً من إرجاع null
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return next(new ApiError(401, `Unauthorized: ${error.message}`));
    }
    // للأخطاء الأخرى (مثل أخطاء Prisma أو أخطاء غير متوقعة)
    console.error("Authentication error:", error); // سجل الخطأ الكامل
    return next(
      new ApiError(500, "Internal server error during authentication")
    );
  }
};

export default authenticate;
