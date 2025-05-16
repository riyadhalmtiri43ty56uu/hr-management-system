// src/server.js
import dotenv from 'dotenv';
import app from './app.js'; // استيراد تطبيق Express المهيأ

// إعداد متغيرات البيئة من .env
dotenv.config({
    path: './.env' // تأكد أن المسار صحيح (يفترض أن .env في جذر مجلد server)
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port http://localhost:${PORT}`);
  console.log(`🔗 Test registration at POST http://localhost:${PORT}/api/auth/register`); // إضافة سجل للتأكيد
});