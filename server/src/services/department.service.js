// src/services/department.service.js
import prisma from "../config/prismaClient.js";
// ApiError قد لا نحتاجه هنا إذا كان asyncHandler يعالج الأخطاء

/**
 * جلب قائمة بجميع الأقسام النشطة للاستخدام في القوائم المنسدلة
 * @returns {Promise<Array<{id: string, name: string, code: string | null}>>}
 */
export const getAllActiveDepartmentsForSelectService = async () => {
  try {
    const departments = await prisma.department.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true, // أضفنا الكود إذا كان مفيدًا
      },
      orderBy: {
        name: "asc",
      },
    });
    return departments;
  } catch (error) {
    console.error(
      "Prisma Error in getAllActiveDepartmentsForSelectService: ",
      error
    );
    throw error; // دع asyncHandler يتعامل مع الخطأ
  }
};

// ... (باقي خدمات CRUD للأقسام يمكنك إضافتها لاحقًا) ...

// (لاحقًا) يمكنك إضافة خدمات أخرى مثل:
// export const createDepartmentService = async (departmentData) => { ... };
// export const getDepartmentByIdService = async (departmentId) => { ... };
// export const updateDepartmentService = async (departmentId, updateData) => { ... };
// export const deleteDepartmentService = async (departmentId) => { ... }; // (الحذف الناعم)
