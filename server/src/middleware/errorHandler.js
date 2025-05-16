// src/middleware/errorHandler.js
import ApiError from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
    let error = err;

    // إذا لم يكن الخطأ من نوع ApiError، قم بتحويله
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500); // ValidationError من Zod أو Joi
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error.errors || [], err.stack);
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}) // أظهر stack trace فقط في التطوير
    };

    console.error("ERROR STACK: ", error.stack); // سجل الخطأ الكامل في الكونسول دائمًا

    return res.status(error.statusCode).json(response);
};

export default errorHandler;