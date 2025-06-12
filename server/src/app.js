// src/app.js
import express from "express";
console.log("app.js: File loaded"); // للتأكد أن الملف يتم تحميله
import cors from "cors";
import cookieParser from "cookie-parser";
import mainApiRouter from "./routes/index.js"; // <-- غيرت اسم الاستيراد ليطابق التصدير من routes/index.js
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || ["http://localhost:5173", "null"], // اسمح بالطلبات من الواجهة الأمامية ومن file://
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static('public')); // إذا كان لديك مجلد public في server
app.use(cookieParser());

// استخدام المسارات الرئيسية
// جميع مسارات API ستبدأ بـ /api
app.use("/api", mainApiRouter); // <-- استخدمت mainApiRouter هنا
console.log("app.js: /api routes configured");

console.log("app.js: Configuring root GET / route..."); // أضف هذا قبل المسار
app.get("/", (req, res) => {
  console.log("app.js: Root GET / route accessed!"); // أضف هذا داخل المعالج
  res.send("HR Management System API is running!");
});
console.log("app.js: Root GET / route configured."); // أضف هذا بعد المسار

// Middleware معالج الأخطاء (يجب أن يكون الأخير)
app.use(errorHandler);

export default app;
