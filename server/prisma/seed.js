// server/prisma/seed.js
import { Role, PrismaClient } from "@prisma/client";

import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(`start seeding ...`);
  // --- 1. إنشاء قسم (Department) ---
  const department1 = await prisma.department.upsert({
    where: { name: "Information Tecnology" }, // ابحث عن القسم بهذا الاسم
    update: {}, // لا تقم بأي تحديث إذا كان موجودًا
    create: {
      name: "Information Tecnology",
      code: "IT",
      description: "Handles all IT infrastructure and software development.",
      isActive: true,
    },
  });
  console.log(
    `Created/Found department: ${department1.name} (ID: ${department1.id})`
  );

  // --- 2. إنشاء وظيفة (Position) داخل هذا القسم ---
  const position1 = await prisma.position.upsert({
    where: {
      title_departmentId: {
        title: "Software Engineer",
        departmentId: department1.id,
      },
    }, // @@unique([title, departmentId])
    update: {},
    create: {
      title: "Software Engineer",
      code: "SWE001",
      description: "Develops and maintains software applications.",
      jobLevel: "Mid-Level",
      baseSalaryMin: 60000,
      baseSalaryMax: 90000,
      departmentId: department1.id,
      isActive: true,
    },
  });
  console.log(
    `Created/Found position: ${position1.title} (ID: ${position1.id})`
  );

  // --- 3. إنشاء مستخدم (User) ليكون موظفًا ---
  const userPassword = "password123";
  const hashedUserPassword = await bcrypt.hash(userPassword, 10);

  const user1 = await prisma.user.upsert({
    where: { email: "employee1@example.com" },
    update: {}, // يمكنك تحديث الأدوار أو البيانات الأخرى إذا كان المستخدم موجودًا
    create: {
      username: "employee.one",
      email: "employee1@example.com",
      hashedPassword: hashedUserPassword,
      firstName: "John",
      lastName: "Doe",
      roles: [Role.USER, Role.HR_MANAGER], // أعطه دور USER و HR_MANAGER للاختبار
      isActive: true,
      isSuperuser: false,
    },
  });
  console.log(
    `Created/Found user: ${user1.email} (ID: ${
      user1.id
    }) with roles: ${user1.roles.join(", ")}`
  );

  // --- 4. إنشاء موظف (Employee) وربطه بالمستخدم والقسم والوظيفة ---
  const employee1 = await prisma.employee.upsert({
    where: { userId: user1.id }, // افترض أن userId فريد للموظف
    update: {},
    create: {
      userId: user1.id,
      employeeCode: "EMP001",
      firstName: user1.firstName || "join", // استخدم بيانات المستخدم إذا كانت موجودة
      lastName: user1.lastName || "Doe",
      departmentId: department1.id,
      positionId: position1.id,
      hireDate: new Date("2025-05-27"),
      phoneNumber: "123456789",
      status: "ACTIVE", // تأكد أن هذه القيمة موجودة في enum EmployeeStatus
      isActive: true,
      // يمكنك إضافة مدير إذا كان لديك موظف آخر كمدير
      // managerId: managerEmployee?.id,
    },
  });
  console.log(
    `Created/Found employee: ${employee1.firstName} ${employee1.lastName} (ID: ${employee1.id})`
  );

  // --- (اختياري) إنشاء مستخدم Admin ---
  const adminPassword = "adminpassword";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gamil.com" },
    update: { roles: { set: [Role.ADMIN, Role.USER] } }, // تأكد من أن لديه دور ADMIN
    create: {
      username: "admin",
      email: "admin@gmail.com",
      hashedPassword: hashedAdminPassword,
      firstName: "Admin",
      lastName: "User",
      roles: [Role.ADMIN, Role.USER], // دور ADMIN مهم
      isSuperuser: true, // عادةً ما يكون للمسؤول الأعلى
      isActive: true,
    },
  });
  console.log(`Created/Found admin user: ${adminUser.email}`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
