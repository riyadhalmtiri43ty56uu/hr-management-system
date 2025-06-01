// src/middleware/validateRequest.js
import ApiError from "../utils/ApiError.js";
import { ZodError } from "zod"; //  <-- استيراد ZodError للتحقق من نوع الخطأ

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    console.error(
      "[Validation Middleware] Error caught:",
      JSON.stringify(error, null, 2)
    ); // اطبع الخطأ الكامل من Zod

    if (error instanceof ZodError) {
      //  <-- تحقق مما إذا كان الخطأ من نوع ZodError
      // إذا كان خطأ Zod، فمن المفترض أن يحتوي على error.errors
      const validationErrors = error.errors.map((err) => ({
        path: err.path.join("."), // err.path هو مصفوفة من أسماء الحقول
        message: err.message,
      }));
      console.error(
        "[Validation Middleware] Formatted Zod Errors:",
        validationErrors
      );
      return next(new ApiError(400, "Validation Failed", validationErrors));
    } else {
      // إذا كان نوع خطأ آخر غير متوقع
      console.error("[Validation Middleware] Unexpected error type:", error);
      return next(
        new ApiError(
          500,
          "An unexpected error occurred during validation.",
          [],
          error.stack
        )
      );
    }
  }
};

export default validate;
