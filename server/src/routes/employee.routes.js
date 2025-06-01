// هذا الملف سيعرف نقطة النهاية لجلب الموظفين ويحميها.
// src/routes/employee.routes.js
import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { Role } from "@prisma/client"; // استيراد enum Role من Prisma Client
import {
  getAllEmployees,
  createEmployee, // افترض أن هذه موجودة
  getEmployeeById, // افترض أن هذه موجودة
  updateEmployee, // <-- دالة جديدة
  deleteEmployee, // <-- دالة جديدة
  getEmployeesForManagerSelect,
} from "../controllers/employee.controller.js";
import validate from "../middleware/validateRequest.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../validators/employee.validators.js"; // تأكد من استيراد updateEmployeeSchema

const router = Router();

// --- ✅  ضع المسارات الأكثر تحديدًا أولاً ---
// GET /api/employees/for-manager-select
router.get(
  "/for-manager-select", // مسار ثابت ومحدد
  authenticate,
  getEmployeesForManagerSelect
);

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

// POST /api/employees - إنشاء موظف جديد (افترض أنه موجود سابقًا)
router.post(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.HR_MANAGER),
  validate(createEmployeeSchema),
  createEmployee
);

// GET /api/employees/:id - جلب موظف معين (افترض أنه موجود سابقًا)
router.get(
  "/:id",
  authenticate,
  // يمكنك إضافة authorizeRoles إذا أردت تحديد من يمكنه رؤية تفاصيل موظف معين
  // أو يمكنك ترك منطق التفويض للخدمة/المتحكم (مثلاً، الموظف يرى ملفه فقط، أو المدير يرى موظفيه)
  authorizeRoles(
    Role.HR_MANAGER,
    Role.ADMIN,
    Role.DEPARTMENT_MANAGER,
    Role.USER
  ), // USER قد يرى ملفه الشخصي فقط (تحكم أدق في الخدمة)
  getEmployeeById
);

// --- ✅ مسار تحديث الموظف ---
// PUT /api/employees/:id
router.put(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.HR_MANAGER), // فقط الأدمن أو مدير الموارد البشرية يمكنهم التحديث (كمثال)
  validate(updateEmployeeSchema), // التحقق من صحة البيانات المرسلة للتحديث
  updateEmployee
);

// --- ✅ مسار "حذف" الموظف (حذف ناعم) ---
// DELETE /api/employees/:id
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.HR_MANAGER), // فقط الأدمن أو مدير الموارد البشرية يمكنهم الحذف (كمثال)
  deleteEmployee
);

// (لاحقًا) أضف مسارات أخرى مثل:
// POST /api/employees - لإنشاء موظف جديد
// router.post('/', authenticate, authorizeRoles(Role.HR_MANAGER, Role.ADMIN), validate(createEmployeeSchema), createEmployee);
// GET /api/employees/:id - لجلب موظف معين
// PUT /api/employees/:id - لتحديث موظف
// DELETE /api/employees/:id - لحذف موظف

export default router;
