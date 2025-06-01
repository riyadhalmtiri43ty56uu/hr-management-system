// src/controllers/position.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import { getAllActivePositionsForSelectService } from "../services/position.service.js";
import ApiResponse from "../utils/ApiResponse.js";

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

// ... (باقي وحدات التحكم CRUD للوظائف يمكنك إضافتها لاحقًا) ...
