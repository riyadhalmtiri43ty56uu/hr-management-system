// server/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // لتحميل متغيرات البيئة من ملف .env

const app = express();
const PORT = process.env.PORT || 5000; // استخدم منفذًا من .env أو 5000 كافتراضي

// Middlewares
app.use(cors()); // للسماح بالطلبات من مصادر مختلفة (مثل React frontend)
app.use(express.json()); // لتحليل طلبات JSON الواردة
app.use(express.urlencoded({ extended: true })); // لتحليل طلبات URL-encoded

// مسار تجريبي
app.get('/api/test', (req, res) => {
    res.json({ message: 'مرحباً من خادم Express!' });
});

// هنا سنضيف المسارات (routes) الخاصة بالتطبيقات المختلفة لاحقًا
// مثال:
// const employeeRoutes = require('./routes/employeeRoutes');
// app.use('/api/employees', employeeRoutes);

app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل على المنفذ http://localhost:${PORT}`);
});