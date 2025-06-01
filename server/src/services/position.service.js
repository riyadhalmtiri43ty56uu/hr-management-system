// src/services/position.service.js
import prisma from "../config/prismaClient.js";

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

// ... (باقي خدمات CRUD للوظائف يمكنك إضافتها لاحقًا) ...
