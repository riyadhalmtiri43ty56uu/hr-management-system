// src/validators/auth.validators.js
import { z } from 'zod';

export const registerUserSchema = z.object({
body: z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    // يمكنك إضافة roles هنا إذا كنت تسمح بتحديدها عند التسجيل (عادة لا)
}),
});

export const loginUserSchema = z.object({
body: z.object({
    // اسمح بتسجيل الدخول إما بـ email أو username
    login: z.string().min(1, "Email or username is required"), // سيتم التحقق منه كـ email أو username في الـ service
    password: z.string().min(1, "Password is required"),
}),
});