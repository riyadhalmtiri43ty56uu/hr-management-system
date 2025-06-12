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

/**
 * إنشاء قسم جديد
 * @param {object} departmentData
 * @returns {Promise<Department>}
 */
export const createDepartmentService = async (departmentData) => {
  const { name, code, parentDepartmentId, managerId } = departmentData;

  // التحقق من تفرد الاسم والكود
  const existingByName = await prisma.department.findUnique({
    where: { name },
  });
  if (existingByName)
    throw new ApiError(409, `اسم القسم '${name}' مستخدم بالفعل.`);
  if (code) {
    const existingByCode = await prisma.department.findUnique({
      where: { code },
    });
    if (existingByCode)
      throw new ApiError(409, `كود القسم '${code}' مستخدم بالفعل.`);
  }

  // التحقق من وجود القسم الأصل إذا تم توفيره
  if (parentDepartmentId) {
    const parentDept = await prisma.department.findUnique({
      where: { id: parentDepartmentId },
    });
    if (!parentDept) throw new ApiError(404, "القسم الأصل المحدد غير موجود.");
  }
  // التحقق من وجود الموظف (المدير) إذا تم توفيره
  if (managerId) {
    const manager = await prisma.employee.findUnique({
      where: { id: managerId },
    });
    if (!manager)
      throw new ApiError(404, "المدير المحدد غير موجود أو ليس موظفًا صالحًا.");
  }

  try {
    const department = await prisma.department.create({
      data: departmentData,
    });
    return department;
  } catch (error) {
    // التعامل مع أخطاء Prisma الأخرى (مثل P2002 لانتهاك قيد فريد لم يتم التحقق منه أعلاه)
    if (error.code === "P2002" && error.meta?.target) {
      throw new ApiError(
        409,
        `القيمة لحقل '${error.meta.target.join(", ")}' يجب أن تكون فريدة.`
      );
    }
    console.error("Prisma Error in createDepartmentService: ", error);
    throw new ApiError(500, "فشل في إنشاء القسم.");
  }
};

/**
 * جلب كل الأقسام (مع دعم للتقسيم والفرز والتصفية لاحقًا)
 * @param {object} queryOptions
 * @returns {Promise<Array<Department>>}
 */
export const getAllDepartmentsService = async (queryOptions = {}) => {
  // لاحقًا: const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc', filter = {} } = queryOptions;
  try {
    const departments = await prisma.department.findMany({
      // where: filter,
      // orderBy: { [sortBy]: sortOrder },
      // skip: (page - 1) * limit,
      // take: parseInt(limit),
      select: {
        // <-- استخدام select لتحديد ما يتم إرجاعه بدقة
        id: true,
        name: true,
        code: true,
        description: true,
        isActive: true,
        createdAt: true,
        // ✅ --- تضمين معلومات القسم الأصل ---
        parentDepartment: {
          select: {
            id: true,
            name: true, // نريد اسم القسم الأصل
          },
        },
        // ------------------------------------
        _count: {
          select: { employees: true, positions: true },
        },
        // يمكنك إضافة manager إذا كانت العلاقة معرفة
        // manager: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: {
        name: "asc", // مثال للترتيب
      },
    });
    return departments;
  } catch (error) {
    console.error("Prisma Error in getAllDepartmentsService: ", error);
    throw error;
  }
};

/**
 * جلب قسم معين بواسطة ID
 * @param {string} departmentId
 * @returns {Promise<Department | null>}
 */
export const getDepartmentByIdService = async (departmentId) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        parentDepartment: { select: { id: true, name: true } },
        subDepartments: { select: { id: true, name: true, code: true } },
        positions: {
          where: { isActive: true },
          select: { id: true, title: true, code: true },
        }, // الوظائف النشطة فقط
        employees: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
          take: 5,
        }, // مثال: أول 5 موظفين نشطين
        _count: {
          select: { employees: true, positions: true },
        },
        // manager: { select: ... } // إذا أضفت علاقة Manager
      },
    });
    if (!department) {
      throw new ApiError(404, "القسم غير موجود.");
    }
    return department;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Prisma Error in getDepartmentByIdService: ", error);
    throw new ApiError(500, "فشل في جلب بيانات القسم.");
  }
};

/**
 * تحديث قسم موجود
 * @param {string} departmentId
 * @param {object} updateData
 * @returns {Promise<Department>}
 */
export const updateDepartmentService = async (departmentId, updateData) => {
  const { name, code, parentDepartmentId, managerId } = updateData;

  // تحقق من وجود القسم
  const existingDepartment = await prisma.department.findUnique({
    where: { id: departmentId },
  });
  if (!existingDepartment)
    throw new ApiError(404, "القسم المراد تحديثه غير موجود.");

  // التحقق من تفرد الاسم والكود (إذا تم تغييرهما)
  if (name && name !== existingDepartment.name) {
    const existingByName = await prisma.department.findUnique({
      where: { name },
    });
    if (existingByName)
      throw new ApiError(409, `اسم القسم '${name}' مستخدم بالفعل.`);
  }
  if (code && code !== existingDepartment.code) {
    const existingByCode = await prisma.department.findUnique({
      where: { code },
    });
    if (existingByCode && existingByCode.id !== departmentId)
      throw new ApiError(409, `كود القسم '${code}' مستخدم بالفعل.`);
  }

  // التحقق من القسم الأصل والمدير إذا تم تغييرهما
  if (parentDepartmentId) {
    if (parentDepartmentId === departmentId)
      throw new ApiError(400, "لا يمكن للقسم أن يكون أبًا لنفسه.");
    const parentDept = await prisma.department.findUnique({
      where: { id: parentDepartmentId },
    });
    if (!parentDept) throw new ApiError(404, "القسم الأصل المحدد غير موجود.");
  }
  if (managerId) {
    const manager = await prisma.employee.findUnique({
      where: { id: managerId },
    });
    if (!manager) throw new ApiError(404, "المدير المحدد غير موجود.");
  }

  try {
    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: updateData,
    });
    return updatedDepartment;
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target) {
      throw new ApiError(
        409,
        `القيمة لحقل '${error.meta.target.join(", ")}' يجب أن تكون فريدة.`
      );
    }
    console.error("Prisma Error in updateDepartmentService: ", error);
    throw new ApiError(500, "فشل في تحديث القسم.");
  }
};

/**
 * "حذف" قسم (حذف ناعم)
 * @param {string} departmentId
 * @returns {Promise<Department>}
 */
export const deleteDepartmentService = async (departmentId) => {
  // تحقق أولاً مما إذا كان القسم لديه أقسام فرعية نشطة أو موظفين نشطين أو وظائف نشطة
  // إذا كان الأمر كذلك، قد ترغب في منع الحذف أو طلب إجراء إضافي.
  // للتبسيط الآن، سنقوم فقط بتحديث حالته.

  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      employees: { where: { isActive: true } }, // تحقق من الموظفين النشطين
      positions: { where: { isActive: true } }, // تحقق من الوظائف النشطة
      subDepartments: { where: { isActive: true } }, // تحقق من الأقسام الفرعية النشطة
    },
  });

  if (!department) {
    throw new ApiError(404, "القسم المراد حذفه غير موجود.");
  }

  // مثال لشرط إضافي: لا تحذف القسم إذا كان به موظفون نشطون
  // if (department.employees.length > 0) {
  //   throw new ApiError(400, `لا يمكن حذف القسم '${department.name}' لأنه يحتوي على موظفين نشطين.`);
  // }
  // يمكنك إضافة شروط مشابهة للوظائف والأقسام الفرعية.

  if (!department.isActive) {
    console.warn(`Department ${departmentId} is already inactive.`);
    // يمكنك اختيار إرجاع القسم كما هو أو رسالة مختلفة
  }

  try {
    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: { isActive: false }, // حذف ناعم
    });
    return updatedDepartment;
  } catch (error) {
    console.error("Prisma Error in deleteDepartmentService: ", error);
    throw new ApiError(500, "فشل في حذف القسم.");
  }
};

// ... (باقي خدمات CRUD للأقسام يمكنك إضافتها لاحقًا) ...

// (لاحقًا) يمكنك إضافة خدمات أخرى مثل:
// export const createDepartmentService = async (departmentData) => { ... };
// export const getDepartmentByIdService = async (departmentId) => { ... };
// export const updateDepartmentService = async (departmentId, updateData) => { ... };
// export const deleteDepartmentService = async (departmentId) => { ... }; // (الحذف الناعم)
