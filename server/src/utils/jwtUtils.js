// server/src/utils/jwtUtils.js
import jwt from "jsonwebtoken"; // تأكد أنك قمت بتثبيت jsonwebtoken (npm install jsonwebtoken)
import dotenv from "dotenv";

// تحميل متغيرات البيئة إذا لم يكن قد تم تحميلها بالفعل
// (عادةً ما يتم تحميلها في server.js، ولكن من الجيد التأكد هنا أيضًا ليكون الملف قابلاً للاستخدام بشكل مستقل)
dotenv.config({ path: "./.env" }); // اضبط المسار إذا كان .env في مكان مختلف بالنسبة لهذا الملف

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d"; // مثال: يوم واحد، يمكنك تغييره
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET; // (اختياري) لـ refresh tokens
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d"; // (اختياري)

// التحقق من وجود المفاتيح السرية الأساسية
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  // في بيئة الإنتاج، من الأفضل إيقاف التطبيق إذا لم يتم تكوين المفاتيح السرية بشكل صحيح
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

/**
 * يولد توكن JWT (Access Token)
 * @param {object} payload - البيانات التي سيتم تضمينها في التوكن (مثل userId, email, roles)
 * @returns {string} - التوكن JWT الموقع
 */
export const generateAccessToken = (payload) => {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * يتحقق من صحة توكن JWT (Access Token) ويعيد الـ payload إذا كان صالحًا
 * @param {string} token - التوكن JWT للتحقق منه
 * @returns {object | null} - الـ payload الخاص بالتوكن إذا كان صالحًا، وإلا null
 */
export const verifyAccessToken = (token) => {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // يمكن تسجيل الخطأ هنا إذا أردت
    // console.error("Token verification error:", error.message);
    return null; // أو ارمي الخطأ ليتم التعامل معه في المكان الذي تم استدعاؤه فيه
    // (مثلاً، middleware المصادقة سيتعامل مع TokenExpiredError أو JsonWebTokenError)
  }
};

// --- (اختياري) دوال لـ Refresh Tokens ---
// Refresh tokens هي توكنات طويلة الأمد تُستخدم للحصول على access tokens جديدة دون الحاجة لإعادة تسجيل الدخول.
// هذا يعزز الأمان لأن access tokens يمكن أن تكون قصيرة الأمد.

/**
 * يولد Refresh Token
 * @param {object} payload - عادةً ما يحتوي فقط على userId
 * @returns {string | null} - الـ Refresh Token إذا تم تكوين JWT_REFRESH_SECRET
 */
export const generateRefreshToken = (payload) => {
  if (!JWT_REFRESH_SECRET) {
    console.warn(
      "JWT_REFRESH_SECRET is not configured. Refresh token cannot be generated."
    );
    return null;
  }
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * يتحقق من صحة Refresh Token
 * @param {string} token - الـ Refresh Token للتحقق منه
 * @returns {object | null} - الـ payload إذا كان صالحًا، وإلا null
 */
export const verifyRefreshToken = (token) => {
  if (!JWT_REFRESH_SECRET) {
    console.warn(
      "JWT_REFRESH_SECRET is not configured. Refresh token cannot be verified."
    );
    return null;
  }
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};
