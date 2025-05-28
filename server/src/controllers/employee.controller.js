// هذا الملف سيستقبل الطلبات، يستدعي الخدمة، ويرسل الرد.
// src/controllers/employee.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import { getAllEmployeesService } from "../services/employee.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const getAllEmployees = asyncHandler(async (req, res) => {
  // لاحقًا، يمكنك أخذ خيارات التصفية والتقسيم من req.query
  const employees = await getAllEmployeesService(req.query);

  if (!employees || employees.length === 0) {
    // يمكنك إرجاع 200 مع مصفوفة فارغة أو 404 إذا كنت تفضل
    // return next(new ApiError(404, "No employees found"));
    return res.status(200).json(new ApiResponse(200, [], "No employees found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, employees, "Employees retrieved successfully"));
});

// (لاحقًا) أضف معالجات أخرى مثل getEmployeeById, createEmployee, etc.
