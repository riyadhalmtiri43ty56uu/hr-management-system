// src/services/position.service.js
import prisma from "../config/prismaClient.js";
import ApiError from "../utils/ApiError.js";

/**
 * جلب قائمة بجميع الوظائف النشطة، مع تصفية اختيارية حسب القسم
 * @param {{ departmentId?: string }} queryOptions
 * @returns {Promise<Array<{id: string, title: string, code: string | null, departmentId: string}>>}
 */
export const getAllActivePositionsForSelectService = async (
  queryOptions = {}
) => {
  const { departmentId } = queryOptions;
  try {
    const positions = await prisma.position.findMany({
      where: {
        isActive: true,
        ...(departmentId && { departmentId: departmentId }), // تصفية حسب القسم إذا تم توفيره
      },
      select: {
        id: true,
        title: true,
        code: true,
        departmentId: true, // مفيد إذا كنت تريد ربطها بالقسم في الواجهة الأمامية
      },
      orderBy: {
        title: "asc",
      },
    });
    return positions;
  } catch (error) {
    console.error(
      "Prisma Error in getAllActivePositionsForSelectService: ",
      error
    );
    throw error;
  }
};

/**
 * إنشاء وظيفة جديدة
 * @param {object} positionData
 * @returns {Promise<Position>}
 */
export const createPositionService = async (positionData) => {
  const { title, departmentId, code } = positionData;

  // التحقق من وجود القسم
  const departmentExists = await prisma.department.findUnique({
    where: { id: departmentId },
  });
  if (!departmentExists) {
    throw new ApiError(404, `القسم بالمعرف '${departmentId}' غير موجود.`);
  }

  // التحقق من تفرد المسمى الوظيفي داخل نفس القسم
  const existingPosition = await prisma.position.findUnique({
    where: { title_departmentId: { title, departmentId } },
  });
  if (existingPosition) {
    throw new ApiError(
      409,
      `المسمى الوظيفي '${title}' موجود بالفعل في هذا القسم.`
    );
  }
  if (code) {
    const existingByCode = await prisma.position.findUnique({
      where: { code },
    });
    if (existingByCode)
      throw new ApiError(409, `كود الوظيفة '${code}' مستخدم بالفعل.`);
  }

  try {
    const position = await prisma.position.create({
      data: positionData,
      include: { department: { select: { id: true, name: true } } }, // إرجاع معلومات القسم
    });
    return position;
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target) {
      throw new ApiError(
        409,
        `القيمة لحقل '${error.meta.target.join(", ")}' يجب أن تكون فريدة.`
      );
    }
    console.error("Prisma Error in createPositionService: ", error);
    throw new ApiError(500, "فشل في إنشاء الوظيفة.");
  }
};

/**
 * جلب كل الوظائف (مع دعم للتقسيم والفرز والتصفية لاحقًا)
 * @param {object} queryOptions - يمكن أن تحتوي على departmentId للتصفية
 * @returns {Promise<Array<Position>>}
 */
export const getAllPositionsService = async (queryOptions = {}) => {
  const { departmentId, isActive } = queryOptions; // مثال لتصفية إضافية
  const filter = {};
  if (departmentId) filter.departmentId = departmentId;
  if (isActive !== undefined)
    filter.isActive = isActive === "true" || isActive === true;

  try {
    const positions = await prisma.position.findMany({
      where: filter,
      include: {
        department: { select: { id: true, name: true, code: true } }, // جلب معلومات القسم
        _count: { select: { employees: true } }, // حساب عدد الموظفين في هذه الوظيفة
      },
      orderBy: { title: "asc" },
    });
    return positions;
  } catch (error) {
    console.error("Prisma Error in getAllPositionsService: ", error);
    throw error;
  }
};

/**
 * جلب وظيفة معينة بواسطة ID
 * @param {string} positionId
 * @returns {Promise<Position | null>}
 */
export const getPositionByIdService = async (positionId) => {
  try {
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: {
        department: { select: { id: true, name: true } },
        employees: {
          where: { isActive: true },
          select: { id: true, firstName: true, lastName: true },
          take: 5,
        },
        _count: { select: { employees: true } },
      },
    });
    if (!position) {
      throw new ApiError(404, "الوظيفة غير موجودة.");
    }
    return position;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Prisma Error in getPositionByIdService: ", error);
    throw new ApiError(500, "فشل في جلب بيانات الوظيفة.");
  }
};

/**
 * تحديث وظيفة موجودة
 * @param {string} positionId
 * @param {object} updateData
 * @returns {Promise<Position>}
 */
export const updatePositionService = async (positionId, updateData) => {
  const { title, departmentId, code } = updateData;

  const existingPosition = await prisma.position.findUnique({
    where: { id: positionId },
  });
  if (!existingPosition)
    throw new ApiError(404, "الوظيفة المراد تحديثها غير موجودة.");

  if (departmentId && departmentId !== existingPosition.departmentId) {
    const departmentExists = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!departmentExists)
      throw new ApiError(
        404,
        `القسم الجديد بالمعرف '${departmentId}' غير موجود.`
      );
  }

  // التحقق من تفرد المسمى الوظيفي داخل القسم (إذا تم تغيير المسمى أو القسم)
  const finalDepartmentId = departmentId || existingPosition.departmentId;
  const finalTitle = title || existingPosition.title;

  if (title || departmentId) {
    // فقط إذا تم تغيير أحدهما
    const conflictingPosition = await prisma.position.findUnique({
      where: {
        title_departmentId: {
          title: finalTitle,
          departmentId: finalDepartmentId,
        },
      },
    });
    // إذا وجدنا وظيفة متعارضة وهي ليست الوظيفة التي نقوم بتحديثها حاليًا
    if (conflictingPosition && conflictingPosition.id !== positionId) {
      throw new ApiError(
        409,
        `المسمى الوظيفي '${finalTitle}' موجود بالفعل في هذا القسم.`
      );
    }
  }
  if (code && code !== existingPosition.code) {
    const existingByCode = await prisma.position.findUnique({
      where: { code },
    });
    if (existingByCode && existingByCode.id !== positionId)
      throw new ApiError(409, `كود الوظيفة '${code}' مستخدم بالفعل.`);
  }

  try {
    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data: updateData,
      include: { department: { select: { id: true, name: true } } },
    });
    return updatedPosition;
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target) {
      throw new ApiError(
        409,
        `القيمة لحقل '${error.meta.target.join(", ")}' يجب أن تكون فريدة.`
      );
    }
    console.error("Prisma Error in updatePositionService: ", error);
    throw new ApiError(500, "فشل في تحديث الوظيفة.");
  }
};

/**
 * "حذف" وظيفة (حذف ناعم)
 * @param {string} positionId
 * @returns {Promise<Position>}
 */
export const deletePositionService = async (positionId) => {
  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { employees: { where: { isActive: true } } },
  });

  if (!position) {
    throw new ApiError(404, "الوظيفة المراد حذفها غير موجودة.");
  }

  // لا تحذف الوظيفة إذا كان بها موظفون نشطون (كمثال)
  if (position.employees.length > 0) {
    throw new ApiError(
      400,
      `لا يمكن حذف الوظيفة '${position.title}' لأنها معينة لموظفين نشطين.`
    );
  }

  if (!position.isActive) {
    console.warn(`Position ${positionId} is already inactive.`);
  }

  try {
    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data: { isActive: false },
    });
    return updatedPosition;
  } catch (error) {
    console.error("Prisma Error in deletePositionService: ", error);
    throw new ApiError(500, "فشل في حذف الوظيفة.");
  }
};

// ... (باقي خدمات CRUD للوظائف يمكنك إضافتها لاحقًا) ...
