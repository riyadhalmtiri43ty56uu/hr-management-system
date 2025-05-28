// هذا الملف سيعرف نقطة النهاية لجلب الموظفين ويحميها.
// src/routes/employee.routes.js
import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { Role } from "@prisma/client"; // استيراد enum Role من Prisma Client
import { getAllEmployees } from "../controllers/employee.controller.js";
// import validate from '../middleware/validateRequest.js';
// import { createEmployeeSchema } from '../validators/employee.validators.js'; // لاحقًا

const router = Router();

// GET /api/employees - جلب كل الموظفين
// محمي: يتطلب تسجيل دخول ودور HR_MANAGER أو ADMIN
router.get(
  "/",
  // هذا يعني أن المستخدم يجب أن يكون لديه واحد على الأقل من الأدوار التالية
  authenticate,
  authorizeRoles(
    Role.HR_MANAGER,
    Role.USER,
    Role.ADMIN,
    Role.DEPARTMENT_MANAGER
  ), // أضفت DEPARTMENT_MANAGER كمثال
  getAllEmployees
);

// (لاحقًا) أضف مسارات أخرى مثل:
// POST /api/employees - لإنشاء موظف جديد
// router.post('/', authenticate, authorizeRoles(Role.HR_MANAGER, Role.ADMIN), validate(createEmployeeSchema), createEmployee);
// GET /api/employees/:id - لجلب موظف معين
// PUT /api/employees/:id - لتحديث موظف
// DELETE /api/employees/:id - لحذف موظف

export default router;
