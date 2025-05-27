// src/middleware/authorize.js
import ApiError from '../utils/ApiError.js';
import AoiError from '../utils/ApiError.js';

// Middleware للتحقق مما إذا كان المستخدم لديه أي من الأدوار المحددة
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // نفترض أن authenticate.js قد أضاف req.user وبه req.user.roles
    if (!req.user || !req.user.roles) {
        return next(new ApiError(401, 'User not authenticated or roles not found'));
    }
    const userRoles = req.user.roles; 
    
    }

}