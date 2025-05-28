// هذا الملف سيحتوي على منطق جلب الموظفين من قاعدة البيانات باستخدام Prisma.
// src/services/employee.service.js
import prisma from "../config/prismaClient.js";
import ApiError from "../utils/ApiError.js";

/**
 * جلب قائمة بجميع الموظفين مع بعض المعلومات الأساسية
 * @param {object} queryOptions - خيارات للاستعلام مثل التصفية، الترتيب، التقسيم (pagination)
 * @returns {Promise<Array<Employee>>}
 */
export const getAllEmployeesService = async (queryOptions = {}) => {
  // لاحقًا يمكنك إضافة منطق للتصفية والترتيب والتقسيم هنا
  // const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', filter = {} } = queryOptions;
  // const skip = (page - 1) * limit;

  try {
    const employees = await prisma.employee.findMany({
      // skip: skip,
      // take: parseInt(limit),
      // orderBy: {
      //   [sortBy]: sortOrder,
      // },
      // where: filter, // يمكنك إضافة فلاتر هنا
      select: {
        // اختر الحقول التي تريد إرجاعها
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        position: {
          // جلب معلومات المنصب المرتبط
          select: {
            title: true,
          },
        },
        department: {
          // جلب معلومات القسم المرتبط
          select: {
            name: true,
          },
        },
        user: {
          // جلب البريد الإلكتروني من نموذج User المرتبط
          select: {
            email: true,
          },
        },
        phoneNumber: true,
        hireDate: true,
        isActive: true,
        // لا ترجع معلومات حساسة مثل user.hashedPassword
      },
      // يمكنك إضافة where: { isActive: true } إذا أردت عرض الموظفين النشطين فقط بشكل افتراضي
    });
    return employees;
  } catch (error) {
    console.error("Error in getAllEmployeesService: ", error);
    throw new ApiError(500, "Failed to fetch employees");
  }
};

// (لاحقًا) يمكنك إضافة خدمات أخرى مثل:
// export const getEmployeeByIdService = async (employeeId) => { ... };
// export const createEmployeeService = async (employeeData) => { ... };
// export const updateEmployeeService = async (employeeId, updateData) => { ... };
// export const deleteEmployeeService = async (employeeId) => { ... };
