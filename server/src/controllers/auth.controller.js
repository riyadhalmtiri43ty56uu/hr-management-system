// src/controllers/auth.controller.js
import asyncHandler from '../utils/asyncHandler.js'; // لتغليف دوال async
import { registerUserService, loginUserService } from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js'; // افترض أن هذا موجود لتوحيد الردود

export const registerUser = asyncHandler(async (req, res) => {
const userData = req.body;
const newUser = await registerUserService(userData);
// لا ترسل كلمة المرور أو أي معلومات حساسة في الرد
res.status(201).json(new ApiResponse(201, newUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
const loginData = req.body;
const { user, token } = await loginUserService(loginData);

// يمكنك إعداد cookie للتوكن إذا أردت (أكثر أمانًا من localStorage لبعض الحالات)
// const options = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === 'production', // فقط عبر HTTPS في الإنتاج
//   sameSite: 'strict', // أو 'lax'
//   maxAge: 24 * 60 * 60 * 1000 // يوم واحد
// };
// res.cookie('accessToken', token, options);

res.status(200).json(new ApiResponse(200, { user, token }, "User logged in successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
// إذا كنت تستخدم cookies للتوكن
// res.clearCookie('accessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
// res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); // إذا كان لديك refresh token

// إذا كان التوكن يتم إرساله في headers والعميل يحذفه من localStorage،
// فالخادم لا يحتاج لفعل الكثير هنا إلا إذا كان هناك قائمة سوداء للتوكنات.
res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});

// يمكنك إضافة دوال أخرى مثل (ForgotPassword, ResetPassword, GetCurrentUserProfile) لاحقًا