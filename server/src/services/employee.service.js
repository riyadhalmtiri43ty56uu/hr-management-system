// هذا الملف سيحتوي على منطق جلب الموظفين من قاعدة البيانات باستخدام Prisma.
// src/services/employee.service.js
import prisma from "../config/prismaClient.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcryptjs"; // نحتاجه لإنشاء مستخدم
import {
  Role,
  EmployeeStatus,
  Gender,
  MaritalStatus,
  /* The above code appears to be a comment section in JavaScript. It mentions the variable
  `EmploymentType` and includes a placeholder ` */
  EmploymentType,
} from "@prisma/client"; // استيراد enum Role

// (getAllEmployeesService كما هي من الرد السابق)
export const getAllEmployeesService = async (queryOptions = {}) => {
  // ... (نفس الأكواد السابقة لـ page, limit, sortBy, etc.) ...
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    search = "",
    firstName,
    lastName,
    email,
    phoneNumber,
    departmentId,
    positionId,
    status,
  } = queryOptions;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10) || 10;
  console.log("Backend: Take Value:", take);

  const whereConditions = { isActive: true };

  if (search) {
    if (!whereConditions.OR) whereConditions.OR = [];
    whereConditions.OR.push(
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { employeeCode: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } }
    );
  }
  if (firstName)
    whereConditions.firstName = { contains: firstName, mode: "insensitive" };
  if (lastName)
    whereConditions.lastName = { contains: lastName, mode: "insensitive" };
  if (email)
    whereConditions.user = { email: { contains: email, mode: "insensitive" } };
  if (phoneNumber)
    whereConditions.phoneNumber = {
      contains: phoneNumber,
      mode: "insensitive",
    };
  if (departmentId) whereConditions.departmentId = departmentId;
  if (positionId) whereConditions.positionId = positionId;
  if (status) whereConditions.status = status;

  const orderByConditions = {};
  if (sortBy && sortOrder) {
    const order = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";
    if (sortBy === "positionTitle") {
      orderByConditions.position = { title: order };
    } else if (sortBy === "departmentName") {
      orderByConditions.department = { name: order };
    } else if (sortBy === "userEmail") {
      orderByConditions.user = { email: order };
    } else {
      orderByConditions[sortBy] = order;
    }
  }

  try {
    // جلب الموظفين
    const employees = await prisma.employee.findMany({
      where: whereConditions,
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        position: { select: { title: true } },
        department: { select: { name: true } },
        user: { select: { email: true } },
        phoneNumber: true,
        hireDate: true,
        isActive: true,
        status: true,
      },
      orderBy: [orderByConditions],
      skip: skip,
      take: take,
    });

    // **** حساب العدد الإجمالي للسجلات المطابقة ****
    let totalEmployees = 0; // ابدأ بـ 0
    try {
      totalEmployees = await prisma.employee.count({
        where: whereConditions,
      });
      console.log("Backend: Total Employees from count:", totalEmployees);
    } catch (countError) {
      console.error("Backend Error during employee.count(): ", countError);
      // إذا فشل count، سنستمر بـ totalEmployees = 0 أو نعطي خطأ
      // في هذه الحالة، لن نُحدث totalRecords وسيعالج الفرونت إند ذلك كحالة "invalid"
      // لكن إذا كان لديك حالات فشل متكررة، يجب معالجتها
    }
    console.log("Backend: Take value:", take);

    // تأكد أن القيمة المُرجعة لـ totalRecords هي دائمًا رقم صحيح
    const finalTotalRecords =
      typeof totalEmployees === "number" && totalEmployees >= 0
        ? totalEmployees
        : 0;

    const pagination = {
      totalRecords: finalTotalRecords,
      currentPage: parseInt(page, 10),
      totalPages: Math.max(1, Math.ceil(finalTotalRecords / take)),
    };

    return {
      success: true,
      data: employees,
      pagination,
      statusCode: 200,
      message: "Employees retrieved successfully",
    };
  } catch (error) {
    console.error("Backend Error in getAllEmployeesService: ", error);
    return {
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    };
  }
};

/**
 * إنشاء موظف جديد ومستخدم مرتبط به
 * @param {object} employeeFullData - بيانات المستخدم والموظف
 * @returns {Promise<Employee>}
 */
export const createEmployeeService = async (employeeFullData) => {
  const {
    // بيانات المستخدم
    email,
    username,
    password,
    // (اختياري) roles, // إذا كنت ستسمح بتعيين أدوار غير افتراضية
    roles: inputRoles,
    // بيانات الموظف
    employeeCode,
    firstName,
    lastName,
    middleName,
    gender,
    dateOfBirth,
    nationality,
    maritalStatus,
    phoneNumber,
    address,
    city,
    country,
    hireDate,
    employmentType,
    status,
    profilePictureUrl,
    jobTitleOverride,
    experienceYears,
    bio,
    departmentId,
    positionId,
    managerId,
  } = employeeFullData;

  console.log("[Create Employee Service] Received data:", employeeFullData);
  console.log("[Create Employee Service] Received roles:", inputRoles);

  // الخطوة 1: التحقق من عدم تكرار البيانات الفريدة
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUserByEmail)
    throw new ApiError(409, "البريد الإلكتروني للمستخدم مسجل مسبقًا.");

  const existingUserByUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUserByUsername)
    throw new ApiError(409, "اسم المستخدم مسجل مسبقًا.");

  const existingEmployeeByCode = await prisma.employee.findUnique({
    where: { employeeCode },
  });
  if (existingEmployeeByCode)
    throw new ApiError(409, "كود الموظف مسجل مسبقًا.");

  if (phoneNumber) {
    // تحقق فقط إذا تم توفير رقم هاتف
    const existingEmployeeByPhone = await prisma.employee.findUnique({
      where: { phoneNumber },
    });
    if (existingEmployeeByPhone)
      throw new ApiError(409, "رقم الهاتف مسجل مسبقًا لموظف آخر.");
  }

  // الخطوة 2: التحقق من وجود القسم والمنصب (والمدير إذا تم توفيره)
  const departmentExists = await prisma.department.findUnique({
    where: { id: departmentId },
  });
  if (!departmentExists) throw new ApiError(404, "القسم المحدد غير موجود.");

  const positionExists = await prisma.position.findUnique({
    where: { id: positionId },
  });
  if (!positionExists) throw new ApiError(404, "المنصب المحدد غير موجود.");

  if (managerId) {
    const managerExists = await prisma.employee.findUnique({
      where: { id: managerId },
    });
    if (!managerExists) throw new ApiError(404, "المدير المحدد غير موجود.");
  }

  // استخدام معاملة (transaction) لضمان إنشاء المستخدم والموظف معًا أو فشلهما معًا
  return prisma.$transaction(async (tx) => {
    // الخطوة 3: إنشاء المستخدم
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- ✅ التأكد من قيمة roles ---
    // إذا لم يتم تمرير roles من الواجهة الأمامية أو كانت مصفوفة فارغة، استخدم USER كافتراضي.
    // تأكد أن القيم في inputRoles هي سلاسل نصية صالحة تطابق قيم enum Role.
    const finalRoles =
      inputRoles && inputRoles.length > 0 ? inputRoles : [Role.USER];
    console.log(
      "[Create Employee Service] Roles to be set for user:",
      finalRoles
    );

    const newUser = await tx.user.create({
      data: {
        email,
        username,
        hashedPassword,
        firstName: firstName, // استخدام اسم الموظف كاسم للمستخدم
        lastName: lastName,
        roles: finalRoles, // تأكد أن Role مستورد من @prisma/client // الدور الافتراضي للموظف الجديد
        isActive: true,
        // status: status || EmployeeStatus.ACTIVE, // استخدام القيمة الافتراضية إذا لم يتم توفيرها
        // userId: newUser.id,
      },
    });
    console.log(
      "[Create Employee Service] newUser object after creation:",
      newUser
    ); // اطبع الكائن newUser بالكامل
    if (!newUser || !newUser.id) {
      console.error(
        "[Create Employee Service] FATAL: newUser or newUser.id is undefined after creation!"
      );
      throw new Error("User creation failed silently or did not return an ID."); // ارمي خطأ واضحًا هنا
    }
    console.log("[Create Employee Service] newUser.id:", newUser.id); // تأكد أن ID موجود

    // الخطوة 4: إنشاء الموظف وربطه بالمستخدم والقسم والمنصب
    const newEmployee = await tx.employee.create({
      data: {
        employeeCode,
        firstName,
        lastName,
        middleName,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, // تحويل السلسلة إلى تاريخ
        nationality,
        maritalStatus,
        phoneNumber,
        address,
        city,
        country,
        hireDate: new Date(hireDate), // تحويل السلسلة إلى تاريخ
        employmentType,
        status: status || EmployeeStatus.ACTIVE,
        profilePictureUrl,
        jobTitleOverride,
        experienceYears,
        bio,
        userId: newUser.id, // الربط بمعرف المستخدم الذي تم إنشاؤه
        departmentId,
        positionId,
        managerId: managerId || null, // تأكد من أنه null إذا لم يتم توفيره
        isActive: true,
      },
      // تحديد الحقول التي سيتم إرجاعها (يمكنك تعديل هذا)
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        user: { select: { email: true, username: true } },
        department: { select: { name: true } },
        position: { select: { title: true } },
      },
    });
    console.log(
      "[Create Employee Service] New employee created:",
      newEmployee.id
    );

    return newEmployee;
  });
};

/**
 * جلب موظف معين بواسطة ID
 * @param {string} employeeId
 * @returns {Promise<Employee | null>}
 */
export const getEmployeeByIdService = async (employeeId) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        // اختر الحقول التي تريد عرضها بتفصيل
        id: true,
        employeeCode: true,
        firstName: true,
        middleName: true,
        lastName: true,
        gender: true,
        dateOfBirth: true,
        nationality: true,
        maritalStatus: true,
        phoneNumber: true,
        address: true,
        city: true,
        country: true,
        hireDate: true,
        employmentType: true,
        status: true,
        profilePictureUrl: true,
        jobTitleOverride: true,
        experienceYears: true,
        bio: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        user: {
          // معلومات المستخدم المرتبط
          select: {
            id: true,
            email: true,
            username: true,
            roles: true,
            isActive: true,
          },
        },
        department: {
          // معلومات القسم
          select: { id: true, name: true, code: true },
        },
        position: {
          // معلومات المنصب
          select: { id: true, title: true, code: true },
        },
        manager: {
          // معلومات المدير المباشر (إذا وجد)
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        // يمكنك إضافة علاقات أخرى هنا مثل directReports إذا أردت
      },
    });
    if (!employee) {
      throw new ApiError(404, "الموظف غير موجود.");
    }
    return employee;
  } catch (error) {
    if (error instanceof ApiError) throw error; // أعد رمي أخطاء ApiError كما هي
    console.error("Prisma Error in getEmployeeByIdService: ", error);
    throw new ApiError(500, "فشل في جلب بيانات الموظف."); // خطأ عام
  }
};

/**
 * تحديث بيانات موظف موجود
 * @param {string} employeeId - معرف الموظف
 * @param {object} updateData - البيانات الجديدة للموظف (وقد تشمل بيانات للمستخدم المرتبط)
 * @returns {Promise<Employee>}
 */
export const updateEmployeeService = async (employeeId, updateData) => {
  // استخراج الحقول المتوقعة من updateData
  // فصلنا email و username الخاصين بالـ User لتجنب الالتباس
  const {
    email: newEmail, // بريد المستخدم الجديد (إذا تم إرساله)
    username: newUsername, // اسم مستخدم المستخدم الجديد (إذا تم إرساله)
    // لا نمرر password أو roles من هنا عادةً لتحديث الموظف
    employeeCode,
    firstName,
    lastName,
    middleName,
    gender,
    dateOfBirth,
    nationality,
    maritalStatus,
    phoneNumber,
    address,
    city,
    country,
    hireDate,
    employmentType,
    status,
    profilePictureUrl,
    jobTitleOverride,
    experienceYears,
    bio,
    departmentId, // ID القسم الجديد
    positionId, // ID المنصب الجديد
    managerId, // ID المدير الجديد
    isActive,
  } = updateData;

  console.log(
    "[Update Employee Service] Received updateData for employeeId:",
    employeeId,
    updateData
  );

  try {
    // --- 1. التحقق من وجود الموظف ---
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true }, // جلب المستخدم المرتبط
    });

    if (!existingEmployee) {
      throw new ApiError(404, "الموظف المراد تحديثه غير موجود.");
    }

    // --- 2. (اختياري) التحقق من تفرد البيانات إذا تم تحديثها ---
    if (employeeCode && employeeCode !== existingEmployee.employeeCode) {
      const takenCode = await prisma.employee.findUnique({
        where: { employeeCode },
      });
      if (takenCode)
        throw new ApiError(409, "كود الموظف الجديد مستخدم بالفعل.");
    }
    if (phoneNumber && phoneNumber !== existingEmployee.phoneNumber) {
      // تحقق فقط إذا كان phoneNumber ليس null أو فارغًا
      if (phoneNumber.trim() !== "") {
        const takenPhone = await prisma.employee.findUnique({
          where: { phoneNumber },
        });
        if (takenPhone)
          throw new ApiError(409, "رقم الهاتف الجديد مستخدم بالفعل.");
      }
    }

    // --- بداية المعاملة (Transaction) ---
    const updatedEmployeeResult = await prisma.$transaction(async (tx) => {
      // --- 2.1. تحديث بيانات المستخدم المرتبط (User model) إذا تم توفيرها ---
      const userUpdatePayload = {};
      if (newEmail && newEmail !== existingEmployee.user.email) {
        const emailTaken = await tx.user.findUnique({
          where: { email: newEmail },
        });
        if (emailTaken && emailTaken.id !== existingEmployee.userId) {
          throw new ApiError(
            409,
            "البريد الإلكتروني الجديد للمستخدم مسجل بالفعل."
          );
        }
        userUpdatePayload.email = newEmail;
      }
      if (newUsername && newUsername !== existingEmployee.user.username) {
        const usernameTaken = await tx.user.findUnique({
          where: { username: newUsername },
        });
        if (usernameTaken && usernameTaken.id !== existingEmployee.userId) {
          throw new ApiError(409, "اسم المستخدم الجديد مسجل بالفعل.");
        }
        userUpdatePayload.username = newUsername;
      }
      // مزامنة أسماء المستخدم مع أسماء الموظف (إذا تغيرت)
      if (firstName && firstName !== existingEmployee.user.firstName)
        userUpdatePayload.firstName = firstName;
      if (lastName && lastName !== existingEmployee.user.lastName)
        userUpdatePayload.lastName = lastName;

      if (Object.keys(userUpdatePayload).length > 0) {
        console.log(
          "[Update Employee Service] Updating user data:",
          userUpdatePayload
        );
        await tx.user.update({
          where: { id: existingEmployee.userId },
          data: userUpdatePayload,
        });
      }

      // --- 2.2. تجهيز بيانات الموظف (Employee model) للتحديث ---
      const employeePrismaUpdateData = {};

      // إضافة الحقول المباشرة إذا كانت موجودة في updateData
      if (employeeCode !== undefined)
        employeePrismaUpdateData.employeeCode = employeeCode;
      if (firstName !== undefined)
        employeePrismaUpdateData.firstName = firstName;
      if (lastName !== undefined) employeePrismaUpdateData.lastName = lastName;
      if (middleName !== undefined)
        employeePrismaUpdateData.middleName =
          middleName === "" ? null : middleName;
      if (gender !== undefined)
        employeePrismaUpdateData.gender = gender === "" ? null : gender; //  Type assertion
      if (dateOfBirth !== undefined)
        employeePrismaUpdateData.dateOfBirth = dateOfBirth
          ? new Date(dateOfBirth)
          : null;
      if (nationality !== undefined)
        employeePrismaUpdateData.nationality =
          nationality === "" ? null : nationality;
      if (maritalStatus !== undefined)
        employeePrismaUpdateData.maritalStatus =
          maritalStatus === "" ? null : maritalStatus; // Type assertion
      if (phoneNumber !== undefined)
        employeePrismaUpdateData.phoneNumber =
          phoneNumber === "" ? null : phoneNumber;
      if (address !== undefined)
        employeePrismaUpdateData.address = address === "" ? null : address;
      if (city !== undefined)
        employeePrismaUpdateData.city = city === "" ? null : city;
      if (country !== undefined)
        employeePrismaUpdateData.country = country === "" ? null : country;
      if (hireDate !== undefined)
        employeePrismaUpdateData.hireDate = hireDate
          ? new Date(hireDate)
          : existingEmployee.hireDate; // لا تجعله null إذا كان مطلوبًا
      if (employmentType !== undefined)
        employeePrismaUpdateData.employmentType =
          employmentType === "" ? null : employmentType; // Type assertion
      if (status !== undefined) employeePrismaUpdateData.status = status; // Type assertion
      if (profilePictureUrl !== undefined)
        employeePrismaUpdateData.profilePictureUrl =
          profilePictureUrl === "" ? null : profilePictureUrl;
      if (jobTitleOverride !== undefined)
        employeePrismaUpdateData.jobTitleOverride =
          jobTitleOverride === "" ? null : jobTitleOverride;
      if (experienceYears !== undefined) {
        const exp = parseInt(experienceYears.toString(), 10);
        employeePrismaUpdateData.experienceYears = isNaN(exp) ? null : exp;
      }
      if (bio !== undefined)
        employeePrismaUpdateData.bio = bio === "" ? null : bio;
      if (isActive !== undefined) employeePrismaUpdateData.isActive = isActive;

      // تحديث العلاقات باستخدام connect (أو disconnect)
      if (departmentId !== undefined) {
        // إذا تم تمرير departmentId (حتى لو كان null أو فارغًا للإزالة)
        if (departmentId && departmentId !== "") {
          // إذا كان ID صالحًا
          employeePrismaUpdateData.department = {
            connect: { id: departmentId },
          };
        } else {
          // لا يمكن جعل departmentId هو null مباشرة إذا كان الحقل إلزاميًا بدون onDelete: SetNull في العلاقة
          // إذا كان departmentId إلزاميًا، يجب أن يتم تمرير ID صالح دائمًا.
          // إذا أردت "إزالة" القسم، فستحتاج إلى منطق مختلف أو جعل العلاقة اختيارية.
          // حاليًا، نموذج Employee يتطلب departmentId.
          if (!departmentId)
            console.warn(
              "Department ID is required for employee update but not provided, department will not be changed."
            );
        }
      }
      if (positionId !== undefined) {
        if (positionId && positionId !== "") {
          employeePrismaUpdateData.position = { connect: { id: positionId } };
        } else {
          if (!positionId)
            console.warn(
              "Position ID is required for employee update but not provided, position will not be changed."
            );
        }
      }
      if (managerId !== undefined) {
        // تم تمرير managerId (قد يكون ID، سلسلة فارغة، أو null)
        if (managerId && managerId !== "") {
          // إذا كان ID صالحًا
          employeePrismaUpdateData.manager = { connect: { id: managerId } };
        } else {
          // إذا كانت سلسلة فارغة أو null، قم بقطع الاتصال
          employeePrismaUpdateData.manager = { disconnect: true };
        }
      }

      console.log(
        "[Update Employee Service] Prisma employee update payload:",
        employeePrismaUpdateData
      );

      if (
        Object.keys(employeePrismaUpdateData).length === 0 &&
        Object.keys(userUpdatePayload).length === 0
      ) {
        console.warn(
          "Update Employee: No actual data provided for update for employeeId:",
          employeeId
        );
        // أرجع الموظف الحالي مع معلومات المستخدم (التي قد تكون حدثت إذا تم تحديثها)
        return tx.employee.findUnique({
          where: { id: employeeId },
          select: {
            /* نفس select statement المستخدمة في نهاية الدالة */
          },
        });
      }

      const updatedEmployee = await tx.employee.update({
        where: { id: employeeId },
        data: employeePrismaUpdateData,
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          middleName: true,
          gender: true,
          dateOfBirth: true,
          nationality: true,
          maritalStatus: true,
          phoneNumber: true,
          address: true,
          city: true,
          country: true,
          hireDate: true,
          employmentType: true,
          status: true,
          profilePictureUrl: true,
          jobTitleOverride: true,
          experienceYears: true,
          bio: true,
          isActive: true,
          user: {
            select: { id: true, email: true, username: true, roles: true },
          },
          department: { select: { id: true, name: true } },
          position: { select: { id: true, title: true } },
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          }, // معلومات المدير المحدثة
        },
      });
      return updatedEmployee;
    }); // نهاية المعاملة

    return updatedEmployeeResult;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.code === "P2002" && error.meta?.target) {
      throw new ApiError(
        409,
        `القيمة لحقل '${error.meta.target.join(", ")}' مستخدمة بالفعل.`
      );
    }
    // خطأ P2025 يعني أن سجل مرتبط مطلوب غير موجود (مثل departmentId غير صالح)
    if (error.code === "P2025") {
      const message =
        error.meta?.cause ||
        "An operation failed because it depends on one or more records that were required but not found.";
      throw new ApiError(400, `خطأ في البيانات المرتبطة: ${message}`);
    }
    console.error("Prisma Error in updateEmployeeService: ", error);
    throw new ApiError(500, "فشل في تحديث بيانات الموظف.", [], error.stack);
  }
};

/**
 * "حذف" موظف (حذف ناعم بتحديث حالته)
 * @param {string} employeeId - معرف الموظف
 * @returns {Promise<Employee>} - الموظف المحدث (غير نشط)
 */
export const deleteEmployeeService = async (employeeId) => {
  try {
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!existingEmployee) {
      throw new ApiError(404, "الموظف المراد حذفه غير موجود.");
    }

    if (!existingEmployee.isActive) {
      // يمكنك اختيار إرجاع رسالة بأن الموظف محذوف بالفعل أو إرجاع بياناته كما هي
      // throw new ApiError(400, 'الموظف محذوف بالفعل (غير نشط).');
      console.warn(`Employee ${employeeId} is already inactive.`);
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        isActive: false, // العلامة الرئيسية للحذف الناعم
        status: EmployeeStatus.TERMINATED, // أو RESIGNED أو أي حالة مناسبة أخرى من enum
        // (اختياري) يمكنك أيضًا تحديث حقل `deletedAt: new Date()` إذا كان لديك
      },
      select: {
        // أرجع فقط الحقول التي تؤكد الحذف الناعم
        id: true,
        isActive: true,
        status: true,
        updatedAt: true,
      },
    });
    return updatedEmployee;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Prisma Error in deleteEmployeeService: ", error);
    throw new ApiError(500, "فشل في حذف الموظف.");
  }
};

/**
 * جلب قائمة مبسطة بالموظفين النشطين لاستخدامهم كمديرين محتملين في القوائم المنسدلة
 * @param {{ excludeEmployeeId?: string }} queryOptions - لاستبعاد الموظف الحالي من قائمة المديرين
 * @returns {Promise<Array<{id: string, firstName: string, lastName: string, employeeCode: string}>>}
 */
export const getEmployeesForManagerSelectService = async (
  queryOptions = {}
) => {
  const { excludeEmployeeId } = queryOptions;
  try {
    const whereClause = {
      isActive: true,
    };
    if (excludeEmployeeId) {
      whereClause.id = { not: excludeEmployeeId }; // لا تقم بتضمين الموظف نفسه
    }

    const managers = await prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true, // مفيد للتمييز
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
    return managers;
  } catch (error) {
    console.error(
      "Prisma Error in getEmployeesForManagerSelectService: ",
      error
    );
    throw error;
  }
};

// (لاحقًا) يمكنك إضافة خدمات أخرى مثل:
// export const getEmployeeByIdService = async (employeeId) => { ... };
// export const createEmployeeService = async (employeeData) => { ... };
// export const updateEmployeeService = async (employeeId, updateData) => { ... };
// export const deleteEmployeeService = async (employeeId) => { ... };
