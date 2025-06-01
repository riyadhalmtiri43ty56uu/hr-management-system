// src/validators/employee.validators.js
import { z } from "zod";
import {
  Gender,
  MaritalStatus,
  EmploymentType,
  EmployeeStatus,
  Role,
} from "@prisma/client";

const cuidMessage = (fieldName) => `${fieldName} غير صالح.`; // دالة مساعدة لرسائل CUID
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateMessage = (fieldName) => `صيغة ${fieldName} يجب أن تكون YYYY-MM-DD.`;

export const createEmployeeSchema = z.object({
  body: z.object({
    email: z.string().email("البريد الإلكتروني يجب أن يكون صالحًا."),
    username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل."),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل."),

    employeeCode: z.string().min(1, "كود الموظف مطلوب."),
    firstName: z.string().min(1, "الاسم الأول مطلوب."),
    lastName: z.string().min(1, "اسم العائلة مطلوب."),
    middleName: z.string().optional().nullable(),
    gender: z
      .nativeEnum(Gender, {
        errorMap: () => ({ message: "قيمة الجنس غير صالحة." }),
      })
      .optional(),
    dateOfBirth: z
      .string()
      .regex(dateRegex, dateMessage("تاريخ الميلاد"))
      .optional()
      .nullable(),
    nationality: z.string().optional().nullable(),
    maritalStatus: z
      .nativeEnum(MaritalStatus, {
        errorMap: () => ({ message: "قيمة الحالة الاجتماعية غير صالحة." }),
      })
      .optional(),
    phoneNumber: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    hireDate: z.string().regex(dateRegex, dateMessage("تاريخ التعيين")),
    employmentType: z
      .nativeEnum(EmploymentType, {
        errorMap: () => ({ message: "قيمة نوع التوظيف غير صالحة." }),
      })
      .optional(),
    status: z
      .nativeEnum(EmployeeStatus, {
        errorMap: () => ({ message: "قيمة حالة الموظف غير صالحة." }),
      })
      .default(EmployeeStatus.ACTIVE)
      .optional(),
    profilePictureUrl: z
      .string()
      .url({ message: "رابط صورة الملف الشخصي غير صالح." })
      .optional()
      .nullable(),
    jobTitleOverride: z.string().optional().nullable(),
    experienceYears: z.coerce
      .number()
      .int()
      .min(0, "سنوات الخبرة يجب أن تكون رقمًا موجبًا.")
      .optional()
      .nullable(), // ✅ استخدام coerce
    bio: z.string().optional().nullable(),
    departmentId: z.string().cuid({ message: cuidMessage("معرف القسم") }),
    positionId: z.string().cuid({ message: cuidMessage("معرف المنصب") }),
    managerId: z
      .string()
      .cuid({ message: cuidMessage("معرف المدير") })
      .optional()
      .nullable(),
  }),
});

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: cuidMessage("معرف الموظف في المسار") }),
  }),
  body: z
    .object({
      // جميع الحقول اختيارية
      employeeCode: z.string().min(1).optional(),
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      middleName: z.string().optional().nullable(),
      gender: z
        .nativeEnum(Gender, {
          errorMap: () => ({ message: "قيمة الجنس غير صالحة." }),
        })
        .optional(),
      dateOfBirth: z
        .string()
        .regex(dateRegex, dateMessage("تاريخ الميلاد"))
        .optional()
        .nullable(),
      nationality: z.string().optional().nullable(),
      maritalStatus: z
        .nativeEnum(MaritalStatus, {
          errorMap: () => ({ message: "قيمة الحالة الاجتماعية غير صالحة." }),
        })
        .optional(),
      phoneNumber: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
      hireDate: z
        .string()
        .regex(dateRegex, dateMessage("تاريخ التعيين"))
        .optional(),
      employmentType: z
        .nativeEnum(EmploymentType, {
          errorMap: () => ({ message: "قيمة نوع التوظيف غير صالحة." }),
        })
        .optional(),
      status: z
        .nativeEnum(EmployeeStatus, {
          errorMap: () => ({ message: "قيمة حالة الموظف غير صالحة." }),
        })
        .optional(),
      profilePictureUrl: z
        .string()
        .url({ message: "رابط صورة الملف الشخصي غير صالح." })
        .optional()
        .nullable(),
      jobTitleOverride: z.string().optional().nullable(),
      experienceYears: z.coerce.number().int().min(0).optional().nullable(),
      bio: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
      departmentId: z
        .string()
        .cuid({ message: cuidMessage("معرف القسم") })
        .optional(),
      positionId: z
        .string()
        .cuid({ message: cuidMessage("معرف المنصب") })
        .optional(),
      managerId: z
        .string()
        .cuid({ message: cuidMessage("معرف المدير") })
        .optional()
        .nullable(),
    })
    .partial(), // .partial() يجعل جميع الحقول في الكائن اختيارية
});
