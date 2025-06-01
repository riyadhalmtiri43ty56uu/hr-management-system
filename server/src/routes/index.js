// src/routes/index.js
import { Router } from "express";
console.log("routes/index.js: File loaded");
import authRoutes from "./auth.routes.js"; // تأكد أن هذا المسار صحيح
import employeeRoutes from "./employee.routes.js"; // <-- استيراد مسارات الموظفين
import departmentRoutes from "./department.routes.js"; // <-- استيراد مسارات الأقسام
import positionRoutes from "./position.routes.js"; // <-- استيراد مسارات الوظائف

const mainRouter = Router(); // استخدم اسمًا مختلفًا إذا كان router مستخدمًا بالفعل

mainRouter.use("/auth", authRoutes); // هنا، كل المسارات داخل authRoutes ستبدأ بـ /auth
mainRouter.use("/employees", employeeRoutes); // <-- استخدام مسارات الموظفين (ستكون تحت /api/employees)

mainRouter.use("/departments", departmentRoutes); // <-- استخدام مسارات الأقسام (ستكون تحت /api/departments)
mainRouter.use("/positions", positionRoutes); // <-- استخدام مسارات الوظائف (ستكون تحت /api/positions)
console.log("routes/index.js: /auth routes configured under mainRouter");
// مثال: /auth/register, /auth/login

export default mainRouter;
