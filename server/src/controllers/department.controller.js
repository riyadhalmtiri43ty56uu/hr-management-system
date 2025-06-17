// src/controllers/department.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import {
  getAllActiveDepartmentsForSelectService,
  createDepartmentService,
  getAllDepartmentsService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,
} from "../services/department.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

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

export const createDepartment = asyncHandler(async (req, res) => {
  const departmentData = req.body;
  const newDepartment = await createDepartmentService(departmentData);
  res
    .status(201)
    .json(
      new ApiResponse(201, newDepartment, "Department created successfully.")
    );
});

export const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await getAllDepartmentsService(req.query); // يمكنك تمرير req.query للفلترة/التقسيم لاحقًا
  res
    .status(200)
    .json(
      new ApiResponse(200, departments, "Departments retrieved successfully.")
    );
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const department = await getDepartmentByIdService(id);
  res
    .status(200)
    .json(
      new ApiResponse(200, department, "Department retrieved successfully.")
    );
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No data provided for update.");
  }
  const updatedDepartment = await updateDepartmentService(id, updateData);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedDepartment,
        "Department updated successfully."
      )
    );
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await deleteDepartmentService(id);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Department marked as inactive successfully."
      )
    );
});

// ... (باقي وحدات التحكم CRUD للأقسام يمكنك إضافتها لاحقًا) ...

// (لاحقًا) أضف معالجات أخرى مثل createDepartment, getDepartmentById, etc.
