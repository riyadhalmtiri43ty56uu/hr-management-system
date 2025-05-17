// src/routes/index.js
import { Router } from 'express';
console.log("routes/index.js: File loaded");
import authRoutes from './auth.routes.js'; // تأكد أن هذا المسار صحيح
// import employeeRoutes from './employee.routes.js'; // مثال لمسارات أخرى

const mainRouter = Router(); // استخدم اسمًا مختلفًا إذا كان router مستخدمًا بالفعل

mainRouter.use('/auth', authRoutes); // هنا، كل المسارات داخل authRoutes ستبدأ بـ /auth
console.log("routes/index.js: /auth routes configured under mainRouter");
// مثال: /auth/register, /auth/login

// mainRouter.use('/employees', employeeRoutes);

export default mainRouter;