// src/services/auth.service.js
import bcrypt from "bcryptjs";
import prisma from "../config/prismaClient.js";
import ApiError from "../utils/ApiError.js";
import { generateAccessToken } from "../utils/jwtUtils.js"; // أزلت generateRefreshToken مؤقتًا إذا لم تكن تستخدمها

export const registerUserService = async (userData) => {
  const { email, username, password, firstName, lastName } = userData;

  console.log("[Register Service] Attempting to register:", {
    email,
    username,
  });

  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUserByEmail) {
    console.log("[Register Service] Email already in use:", email);
    throw new ApiError(409, "Email already in use");
  }
  const existingUserByUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUserByUsername) {
    console.log("[Register Service] Username already in use:", username);
    throw new ApiError(409, "Username already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("[Register Service] Password hashed for user:", username);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      hashedPassword,
      firstName,
      lastName,
      roles: ["USER"],
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      roles: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  console.log("[Register Service] User created successfully:", user.id);
  return user;
};

export const loginUserService = async (loginData) => {
  const { login, password } = loginData;
  console.log(`[Login Service] Attempting login for identifier: "${login}"`);

  // تحويل قيمة "login" إلى أحرف صغيرة إذا كانت تمثل بريدًا إلكترونيًا للبحث غير الحساس لحالة الأحرف
  // هذا افتراض أن البريد الإلكتروني يُخزن بأحرف صغيرة أو أن المقارنة يجب أن تكون كذلك
  // إذا كان اسم المستخدم حساسًا لحالة الأحرف، فلا تقم بتحويله إذا كان 'login' هو اسم مستخدم.
  // للتبسيط، سنفترض أن 'login' يمكن أن يكون أيًا منهما ونبحث بكلا الطريقتين.
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: login.toLowerCase() }, // جرب البحث بالبريد الإلكتروني (غير حساس لحالة الأحرف)
        { username: login }, // وجرب البحث باسم المستخدم (عادة ما يكون حساسًا لحالة الأحرف)
      ],
    },
  });

  if (!user) {
    console.error(`[Login Service] User not found for identifier: "${login}"`);
    throw new ApiError(401, "Invalid credentials (user not found)"); // الخطأ هنا
  }
  console.log(
    `[Login Service] User found: ID=${user.id}, Username=${user.username}, Email=${user.email}, IsActive=${user.isActive}`
  );

  // عرض كلمة المرور المستلمة والهاش المخزن (للتصحيح فقط، احذف هذا في الإنتاج!)
  console.log(`[Login Service] Password received: "${password}"`);
  console.log(
    `[Login Service] Hashed password from DB for ${user.username}: "${user.hashedPassword}"`
  );

  const isPasswordMatch = await bcrypt.compare(password, user.hashedPassword);
  console.log(
    `[Login Service] Password match result for ${user.username}: ${isPasswordMatch}`
  );

  if (!isPasswordMatch) {
    console.error(
      `[Login Service] Password mismatch for user: "${user.username}"`
    );
    throw new ApiError(401, "Invalid credentials (password mismatch)"); // أو الخطأ هنا
  }

  if (!user.isActive) {
    console.warn(
      `[Login Service] User account is not active: "${user.username}"`
    );
    throw new ApiError(403, "User account is not active");
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
    roles: user.roles,
  };

  const accessToken = generateAccessToken(tokenPayload);
  console.log(
    `[Login Service] Access token generated for user: "${user.username}"`
  );

  const { hashedPassword, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token: accessToken,
  };
};
