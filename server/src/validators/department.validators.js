// src/validators/department.validators.js
import { z } from "zod";

const cuidMessage = (fieldName) => `${fieldName} غير صالح.`;

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "اسم القسم يجب أن يكون حرفين على الأقل.").max(100),
    code: z
      .string()
      .max(50)
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)), // تحويل السلسلة الفارغة إلى null
    description: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    parentDepartmentId: z
      .string()
      .cuid({ message: cuidMessage("معرف القسم الأصل") })
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)), // اسمح بـ null إذا لم يكن هناك قسم أب
    managerId: z
      .string()
      .cuid({ message: cuidMessage("معرف المدير") })
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)), // اسمح بـ null إذا لم يتم تعيين مدير
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: cuidMessage("معرف القسم في المسار") }),
  }),
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      code: z
        .string()
        .max(50)
        .optional()
        .nullable()
        .transform((val) => (val === "" ? null : val)),
      description: z
        .string()
        .optional()
        .nullable()
        .transform((val) => (val === "" ? null : val)),
      parentDepartmentId: z
        .string()
        .cuid({ message: cuidMessage("معرف القسم الأصل") })
        .optional()
        .nullable()
        .transform((val) => (val === "" ? null : val)),
      managerId: z
        .string()
        .cuid({ message: cuidMessage("معرف المدير") })
        .optional()
        .nullable()
        .transform((val) => (val === "" ? null : val)),
      isActive: z.boolean().optional(),
    })
    .partial(), // .partial() يجعل جميع حقول body اختيارية
});
