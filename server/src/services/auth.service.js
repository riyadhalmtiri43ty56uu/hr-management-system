// src/services/auth.service.js
import bcrypt from 'bcryptjs';
import prisma from '../config/prismaClient.js'; // استيراد Prisma client
import ApiError from '../utils/ApiError.js';
import { generateToken } from '../utils/jwtUtils.js'; // لاستخدامها في تسجيل الدخول

export const registerUserService = async (userData) => {
const { email, username, password, firstName, lastName } = userData;

// التحقق مما إذا كان البريد الإلكتروني أو اسم المستخدم موجودًا بالفعل
const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
if (existingUserByEmail) {
    throw new ApiError(409, 'Email already in use'); // 409 Conflict
}
const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
if (existingUserByUsername) {
    throw new ApiError(409, 'Username already in use');
}

// تجزئة كلمة المرور
const hashedPassword = await bcrypt.hash(password, 10); // 10 هو salt rounds

// إنشاء مستخدم جديد
const user = await prisma.user.create({
    data: {
    email,
    username,
    hashedPassword,
    firstName,
    lastName,
    // ✅ ---  جرب هذا التعديل الدقيق ---
    // عندما يكون الحقل في المخطط هو Role[] (مصفوفة enum)،
    // يجب أن تكون قادرًا على تمرير مصفوفة من السلاسل النصية مباشرة.
    // الخطأ "Expected Role" يشير إلى أن Prisma لا يتعرف على "USER"
    // كنص صالح لـ enum Role. هذا غريب إذا كان enum Role معرفًا بشكل صحيح.
    roles: ["USER"], // هذا هو الشكل الذي يجب أن يعمل.
    // ------------------------------------
    },
    // استبعاد كلمة المرور من الكائن المرجع
    select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        roles: true,
        createdAt: true,
        updatedAt: true
    }
});

return user;
};

export const loginUserService = async (loginData) => {
const { login, password } = loginData;

// البحث عن المستخدم إما بالبريد الإلكتروني أو اسم المستخدم
const user = await prisma.user.findFirst({
    where: {
    OR: [
        { email: login },
        { username: login },
    ],
    },
});

if (!user) {
    throw new ApiError(401, 'Invalid credentials'); // 401 Unauthorized
}

// التحقق من كلمة المرور
const isPasswordMatch = await bcrypt.compare(password, user.hashedPassword);
if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid credentials');
}

if (!user.isActive) {
    throw new ApiError(403, 'User account is not active'); // 403 Forbidden
}

// إنشاء توكن JWT
const tokenPayload = {
    userId: user.id,
    email: user.email,
    roles: user.roles,
};
const token = generateToken(tokenPayload);

// إزالة كلمة المرور من كائن المستخدم قبل إرجاعه
const { hashedPassword, ...userWithoutPassword } = user;

return { user: userWithoutPassword, token };
};