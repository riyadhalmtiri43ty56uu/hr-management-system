// src/utils/jwtUtils.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // يجب أن يكون معرفًا في .env
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // مثال: يوم واحد

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1); // أوقف التطبيق إذا لم يكن المفتاح السري معرفًا
}

export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null; // أو ارمي الخطأ ليتم التعامل معه
    }
};