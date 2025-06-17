// src/controllers/position.controller.js
// src/controllers/position.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import {
  getAllActivePositionsForSelectService,
  createPositionService,
  getAllPositionsService,
  getPositionByIdService,
  updatePositionService,
  deletePositionService,
} from "../services/position.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const getAllActivePositionsForSelect = asyncHandler(async (req, res) => {
  const queryOptions = {};
  if (req.query.departmentId) {
    // تحقق مما إذا كان departmentId موجودًا في query params
    queryOptions.departmentId = req.query.departmentId;
  }
  const positions = await getAllActivePositionsForSelectService(queryOptions);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        positions,
        "Active positions retrieved successfully for select list."
      )
    );
});

export const createPosition = asyncHandler(async (req, res) => {
  const positionData = req.body;
  const newPosition = await createPositionService(positionData);
  res
    .status(201)
    .json(new ApiResponse(201, newPosition, "Position created successfully."));
});

export const getAllPositions = asyncHandler(async (req, res) => {
  // يمكنك تمرير req.query للسماح بتصفية الوظائف (مثل حسب القسم)
  const positions = await getAllPositionsService(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, positions, "Positions retrieved successfully."));
});

export const getPositionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const position = await getPositionByIdService(id);
  res
    .status(200)
    .json(new ApiResponse(200, position, "Position retrieved successfully."));
});

export const updatePosition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No data provided for update.");
  }
  const updatedPosition = await updatePositionService(id, updateData);
  res
    .status(200)
    .json(
      new ApiResponse(200, updatedPosition, "Position updated successfully.")
    );
});

export const deletePosition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await deletePositionService(id);
  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Position marked as inactive successfully.")
    );
});

// ... (باقي وحدات التحكم CRUD للوظائف يمكنك إضافتها لاحقًا) ...
