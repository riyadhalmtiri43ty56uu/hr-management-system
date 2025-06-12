// src/routes/department.routes.js
import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js"; // قد لا تحتاج لصلاحيات محددة لجلب القائمة للاختيار
import { Role } from "@prisma/client";
import {
  getAllActiveDepartmentsForSelect,
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "../validators/department.validators.js";
import validate from "../middleware/validateRequest.js";

const router = Router();

// GET /api/departments/for-select - جلب قائمة الأقسام النشطة للقوائم المنسدلة
// هذا المسار قد لا يحتاج إلى صلاحيات معقدة، ربما يكفي أن يكون المستخدم مسجلاً دخوله.
router.get(
  "/for-select",
  authenticate, // تأكد أن المستخدم مسجل دخوله على الأقل
  // يمكنك إضافة authorizeRoles إذا أردت تقييد من يمكنه رؤية هذه القائمة
  // authorizeRoles(Role.USER, Role.HR_MANAGER, Role.ADMIN, Role.DEPARTMENT_MANAGER),
  getAllActiveDepartmentsForSelect
);

// POST /api/departments - إنشاء قسم جديد
router.post(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.HR_MANAGER), // مثال لصلاحيات
  validate(createDepartmentSchema),
  createDepartment
);

// GET /api/departments - جلب كل الأقسام (مع تفاصيل أكثر)
router.get(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER), // مثال
  getAllDepartments
);

// GET /api/departments/:id - جلب قسم معين
router.get(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER), // مثال
  getDepartmentById
);

// PUT /api/departments/:id - تحديث قسم
router.put(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.HR_MANAGER), // مثال
  validate(updateDepartmentSchema),
  updateDepartment
);

// DELETE /api/departments/:id - "حذف" قسم (حذف ناعم)
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN), // مثال (قد يكون الأدمن فقط هو من يحذف)
  deleteDepartment
);

// (لاحقًا) أضف مسارات CRUD الكاملة للأقسام:
// router.post('/', authenticate, authorizeRoles(Role.ADMIN), validate(createDepartmentSchema), createDepartment);
// router.get('/', authenticate, authorizeRoles(Role.ADMIN, Role.HR_MANAGER), getAllDepartments); // مسار لجلب كل الأقسام مع تفاصيل
// router.get('/:id', authenticate, authorizeRoles(Role.ADMIN, Role.HR_MANAGER), getDepartmentById);
// router.put('/:id', authenticate, authorizeRoles(Role.ADMIN), validate(updateDepartmentSchema), updateDepartment);
// router.delete('/:id', authenticate, authorizeRoles(Role.ADMIN), deleteDepartment);

export default router;
