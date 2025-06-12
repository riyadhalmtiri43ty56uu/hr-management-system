// src/routes/position.routes.js
import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { Role } from "@prisma/client";
import {
  getAllActivePositionsForSelect,
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition,
} from "../controllers/position.controller.js";
import validate from "../middleware/validateRequest.js";
import {
  createPositionSchema,
  updatePositionSchema,
} from "../validators/position.validators.js";

const router = Router();

// GET /api/positions/for-select - جلب قائمة الوظائف النشطة للقوائم المنسدلة
router.get("/for-select", authenticate, getAllActivePositionsForSelect);

// POST /api/positions - إنشاء وظيفة جديدة
router.post(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.HR_MANAGER),
  validate(createPositionSchema),
  createPosition
);

// GET /api/positions - جلب كل الوظائف
router.get(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  getAllPositions
);

// GET /api/positions/:id - جلب وظيفة معينة
router.get(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  getPositionById
);

// PUT /api/positions/:id - تحديث وظيفة
router.put(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.HR_MANAGER),
  validate(updatePositionSchema),
  updatePosition
);

// DELETE /api/positions/:id - "حذف" وظيفة (حذف ناعم)
router.delete("/:id", authenticate, authorizeRoles(Role.ADMIN), deletePosition);

// (لاحقًا) مسارات CRUD الكاملة للوظائف

export default router;
