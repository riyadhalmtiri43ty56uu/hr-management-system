// src/controllers/department.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import { getAllActiveDepartmentsForSelectService } from "../services/department.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getAllActiveDepartmentsForSelect = asyncHandler(
  async (req, res) => {
    const departments = await getAllActiveDepartmentsForSelectService();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          departments,
          "Active departments retrieved successfully for select list."
        )
      );
  }
);

// ... (باقي وحدات التحكم CRUD للأقسام يمكنك إضافتها لاحقًا) ...

// (لاحقًا) أضف معالجات أخرى مثل createDepartment, getDepartmentById, etc.
