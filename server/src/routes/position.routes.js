// src/routes/position.routes.js
import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
// import { authorizeRoles } from '../middleware/authorize.js';
// import { Role } from '@prisma/client';
import { getAllActivePositionsForSelect } from "../controllers/position.controller.js";

const router = Router();

// GET /api/positions/for-select - جلب قائمة الوظائف النشطة للقوائم المنسدلة
router.get("/for-select", authenticate, getAllActivePositionsForSelect);

// (لاحقًا) مسارات CRUD الكاملة للوظائف

export default router;
