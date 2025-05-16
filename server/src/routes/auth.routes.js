// src/routes/auth.routes.js
import { Router } from 'express';
console.log("routes/auth.routes.js: File loaded");
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controller.js';
import validate from '../middleware/validateRequest.js'; // تأكد أن هذا المسار صحيح
import { registerUserSchema, loginUserSchema } from '../validators/auth.validators.js'; // تأكد أن هذا المسار صحيح

const router = Router();

router.post('/register', validate(registerUserSchema), registerUser); // المسار هنا هو '/register'
console.log("routes/auth.routes.js: POST /register route defined");
router.post('/login', validate(loginUserSchema), loginUser);
router.post('/logout', logoutUser);

export default router;