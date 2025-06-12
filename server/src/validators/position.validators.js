// src/validators/position.validators.js
import { z } from "zod";

const cuidMessage = (fieldName) => `${fieldName} غير صالح.`;
const requiredMessage = (fieldName) => `${fieldName} مطلوب.`;
const stringMinMaxMessage = (fieldName, min, max) =>
  `${fieldName} يجب أن يكون بين ${min} و ${max} حرفًا.`;

export const createPositionSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .min(2, stringMinMaxMessage("المسمى الوظيفي", 2, 100))
        .max(100),
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
      jobLevel: z
        .string()
        .max(50)
        .optional()
        .nullable()
        .transform((val) => (val === "" ? null : val)),
      departmentId: z.string().cuid({ message: cuidMessage("معرف القسم") }), // هذا مطلوب لربط الوظيفة بقسم
      baseSalaryMin: z.coerce
        .number()
        .positive("الحد الأدنى للراتب يجب أن يكون موجبًا.")
        .optional()
        .nullable(),
      baseSalaryMax: z.coerce
        .number()
        .positive("الحد الأقصى للراتب يجب أن يكون موجبًا.")
        .optional()
        .nullable(),
      isActive: z.boolean().optional().default(true),
    })
    .refine(
      (data) =>
        !data.baseSalaryMin ||
        !data.baseSalaryMax ||
        data.baseSalaryMax >= data.baseSalaryMin,
      {
        message: "الحد الأقصى للراتب يجب أن يكون أكبر من أو يساوي الحد الأدنى.",
        path: ["baseSalaryMax"], // حدد الحقل الذي يتعلق به الخطأ
      }
    ),
});

export const updatePositionSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: cuidMessage("معرف الوظيفة في المسار") }),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(2, stringMinMaxMessage("المسمى الوظيفي", 2, 100))
        .max(100)
        .optional(),
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
      jobLevel: z
        .string()
        .max(50)
        .optional()
        .nullable()
        .transform((val) => (val === "" ? null : val)),
      departmentId: z
        .string()
        .cuid({ message: cuidMessage("معرف القسم") })
        .optional(), // قد تسمح بتغيير القسم
      baseSalaryMin: z.coerce
        .number()
        .positive("الحد الأدنى للراتب يجب أن يكون موجبًا.")
        .optional()
        .nullable(),
      baseSalaryMax: z.coerce
        .number()
        .positive("الحد الأقصى للراتب يجب أن يكون موجبًا.")
        .optional()
        .nullable(),
      isActive: z.boolean().optional(),
    })
    .partial()
    .refine(
      (data) =>
        !data.baseSalaryMin ||
        !data.baseSalaryMax ||
        data.baseSalaryMax >= data.baseSalaryMin,
      {
        message: "الحد الأقصى للراتب يجب أن يكون أكبر من أو يساوي الحد الأدنى.",
        path: ["baseSalaryMax"],
      }
    ),
});
