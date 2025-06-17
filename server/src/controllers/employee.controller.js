// هذا الملف سيستقبل الطلبات، يستدعي الخدمة، ويرسل الرد.
// src/controllers/employee.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import {
  getAllEmployeesService,
  createEmployeeService, // افترض أن هذه موجودة من الخطوات السابقة
  getEmployeeByIdService, // افترض أن هذه موجودة
  updateEmployeeService, // <-- دالة جديدة
  deleteEmployeeService, // <-- دالة جديدة
  getEmployeesForManagerSelectService,
} from "../services/employee.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// (دالة getAllEmployees و createEmployee و getEmployeeById كما هي من الردود السابقة)
export const getAllEmployees = asyncHandler(async (req, res) => {
  // جميع معاملات البحث والفرز والتقسيم تأتي من req.query
  const result = await getAllEmployeesService(req.query);

  // لم نعد بحاجة للتحقق من employees.length === 0 هنا،
  // لأن الخدمة ترجع كائنًا به data و pagination
  // إذا كانت data فارغة، فهذا يعني أنه لا توجد نتائج تطابق البحث/الفلتر

  res
    .status(200)
    .json(
      new ApiResponse(200, result.data, "Employees retrieved successfully", {
        pagination: result.pagination,
      })
    );
});

export const createEmployee = asyncHandler(async (req, res) => {
  // (مثال لدالة إنشاء افترض أنها موجودة)
  const employeeFullData = req.body;
  const newEmployee = await createEmployeeService(employeeFullData);
  res
    .status(201)
    .json(new ApiResponse(201, newEmployee, "Employee created successfully"));
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  // (مثال لدالة جلب افترض أنها موجودة)
  const { id } = req.params;
  const employee = await getEmployeeByIdService(id);
  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, employee, "Employee retrieved successfully"));
});

// --- ✅ دالة تحديث الموظف ---
export const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params; // الحصول على ID الموظف من معلمات المسار
  const updateData = req.body; // البيانات الجديدة للتحديث من هيئة الطلب

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No data provided for update.");
  }

  const updatedEmployee = await updateEmployeeService(id, updateData);
  res
    .status(200)
    .json(
      new ApiResponse(200, updatedEmployee, "Employee updated successfully")
    );
});

// --- ✅ دالة "حذف" الموظف (حذف ناعم) ---
export const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params; // الحصول على ID الموظف من معلمات المسار

  const deletedEmployeeInfo = await deleteEmployeeService(id); // سيقوم بالحذف الناعم
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedEmployeeInfo,
        "Employee marked as inactive successfully"
      )
    );
  // أو يمكنك إرجاع 204 No Content إذا لم ترد إرجاع أي بيانات
  // res.status(204).send();
});

export const getEmployeesForManagerSelect = asyncHandler(async (req, res) => {
  // يمكنك إضافة query param لاستبعاد موظف معين (مثل الموظف الذي يتم تعديله حاليًا)
  const queryOptions = { excludeEmployeeId: req.query.excludeId };
  const managers = await getEmployeesForManagerSelectService(queryOptions);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        managers,
        "Potential managers retrieved successfully."
      )
    );
});

// (لاحقًا) أضف معالجات أخرى مثل getEmployeeById, createEmployee, etc.
