// src/middleware/validateRequest.js
import ApiError from '../utils/ApiError.js'; // افترض أن هذا موجود

const validate = (schema) => async (req, res, next) => {
try {
    await schema.parseAsync({
    body: req.body,
    query: req.query,
    params: req.params,
    });
    return next();
} catch (error) {
    // خطأ التحقق من Zod
    const validationErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
    }));
    return next(new ApiError(400, "Validation Failed", validationErrors));
}
};

export default validate;