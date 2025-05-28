// src/services/auth.service.js
import bcrypt from "bcryptjs";
import prisma from "../config/prismaClient.js";
import ApiError from "../utils/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtUtils.js"; // <-- ✅ استيراد الدالة

export const registerUserService = async (userData) => {
  /* ... (نفس الكود) ... */
};

export const loginUserService = async (loginData) => {
  const { login, password } = loginData;

  const user = await prisma.user.findFirst({
    /* ... */
  });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isPasswordMatch = await bcrypt.compare(password, user.hashedPassword);
  if (!isPasswordMatch) throw new ApiError(401, "Invalid credentials");

  if (!user.isActive) throw new ApiError(403, "User account is not active");

  // إنشاء payload للتوكن
  const tokenPayload = {
    userId: user.id,
    email: user.email, // يمكنك إضافة username إذا أردت
    roles: user.roles,
  };

  // ✅ استخدام دالة التوليد الجديدة
  const accessToken = generateAccessToken(tokenPayload);
  // (اختياري) توليد refresh token
  // const refreshToken = generateRefreshToken({ userId: user.id }); // عادةً ما يحتوي فقط على userId

  const { hashedPassword, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token: accessToken, // أرسل Access Token
    // refreshToken: refreshToken, // (اختياري) أرسل Refresh Token
  };
};
