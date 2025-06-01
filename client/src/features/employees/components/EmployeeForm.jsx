// src/features/employees/components/EmployeeForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import axiosInstance from "../../../config/axiosInstance"; // لاستدعاء API

// --- تعريف كلاسات CSS الموحدة (يمكن نقلها لملف عام) ---
const inputBaseClasses =
  "w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm";
const inputDefaultClasses =
  "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500/50";
const inputErrorClasses =
  "border-red-500 dark:border-red-600 focus:ring-red-500/50 text-red-700 dark:text-red-300 placeholder-red-400 dark:placeholder-red-500";
const labelClasses =
  "block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
const errorMessageClasses = "text-xs text-red-600 dark:text-red-400 mt-1";
const fieldsetClasses = "border dark:border-slate-600 p-4 rounded-lg";
const legendClasses =
  "text-md font-semibold px-2 text-sky-600 dark:text-sky-400";

// --- قيم Enum (للاختيار من متعدد، تطابق ما في Prisma Schema) ---
const GENDERS = ["MALE", "FEMALE", "OTHER"];
const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"];
const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN"];
const EMPLOYEE_STATUSES = [
  "ACTIVE",
  "ON_LEAVE",
  "TERMINATED",
  "RESIGNED",
  "PROBATION",
];
// ROLES عادة لا يتم تعيينها مباشرة من هنا، بل لها منطق خاص أو قيمة افتراضية

const EmployeeForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  formType = "add",
  serverValidationErrors = {},
}) => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const defaultHireDate = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "", // User fields
    employeeCode: "",
    firstName: "",
    lastName: "",
    middleName: "",
    gender: "",
    dateOfBirth: "",
    nationality: "",
    maritalStatus: "",
    phoneNumber: "",
    address: "",
    city: "",
    country: "",
    hireDate: defaultHireDate,
    employmentType: "",
    status: "ACTIVE",
    profilePictureUrl: "",
    jobTitleOverride: "",
    experienceYears: "",
    bio: "",
    departmentId: "",
    positionId: "",
    managerId: "",
    isActive: true,
  });

  const [localValidationErrors, setLocalValidationErrors] = useState({});
  const displayErrors = { ...localValidationErrors, ...serverValidationErrors };

  // --- حالات للقوائم المنسدلة ---
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);

  // --- جلب بيانات القوائم المنسدلة ---
  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsDropdownLoading(true);
      try {
        const [deptsRes, posRes, empsRes] = await Promise.all([
          axiosInstance.get("/departments/for-select"),
          axiosInstance.get("/positions/for-select"), // يمكنك تصفيتها لاحقًا بـ departmentId
          axiosInstance.get(
            "/employees/for-manager-select" +
              (initialData?.id ? `?excludeId=${initialData.id}` : "")
          ), // استبعاد الموظف الحالي عند التعديل
        ]);

        if (deptsRes.data.success) {
          setDepartments([
            { id: "", name: t("employees.form.selectDepartment") },
            ...deptsRes.data.data,
          ]);
        }
        if (posRes.data.success) {
          setPositions([
            { id: "", name: t("employees.form.selectPosition") },
            ...posRes.data.data,
          ]);
        }
        if (empsRes.data.success) {
          const potentialManagers = empsRes.data.data.filter(
            (emp) => emp.id !== initialData?.id
          ); // لا يمكن للموظف أن يكون مدير نفسه
          setManagers([
            {
              id: "",
              name: t("employees.form.selectManager", {
                defaultValue: "Select Manager (Optional)",
              }),
            },
            ...potentialManagers.map((emp) => ({
              id: emp.id,
              name: `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`,
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
        // يمكنك تعيين رسالة خطأ هنا إذا أردت
      } finally {
        setIsDropdownLoading(false);
      }
    };
    fetchDropdownData();
  }, [t, initialData?.id]); // أعد الجلب إذا تغير الموظف المعدل (لتحديث قائمة المديرين)

  // --- ملء النموذج بالبيانات الأولية عند التعديل ---
  useEffect(() => {
    if (formType === "edit" && initialData) {
      const formattedData = { ...initialData };
      if (formattedData.dateOfBirth)
        formattedData.dateOfBirth = new Date(formattedData.dateOfBirth)
          .toISOString()
          .split("T")[0];
      if (formattedData.hireDate)
        formattedData.hireDate = new Date(formattedData.hireDate)
          .toISOString()
          .split("T")[0];
      if (initialData.user) {
        formattedData.email = initialData.user.email || "";
        formattedData.username = initialData.user.username || "";
      }
      formattedData.password = "";
      formattedData.confirmPassword = "";

      // ✅  مهم: تعيين معرفات العلاقات
      formattedData.departmentId = initialData.department?.id || ""; // احصل على ID من الكائن المتداخل
      formattedData.positionId = initialData.position?.id || "";
      formattedData.managerId = initialData.manager?.id || ""; // قد يكون null
      // تأكد أن القيم النصية للـ enums موجودة في formData
      setFormData((prev) => ({ ...prev, ...formattedData }));
    } else {
      setFormData({
        // إعادة تعيين للحالة الأولية للإضافة
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        employeeCode: "",
        firstName: "",
        lastName: "",
        middleName: "",
        gender: "",
        dateOfBirth: "",
        nationality: "",
        maritalStatus: "",
        phoneNumber: "",
        address: "",
        city: "",
        country: "",
        hireDate: defaultHireDate,
        employmentType: "",
        status: "ACTIVE",
        profilePictureUrl: "",
        jobTitleOverride: "",
        experienceYears: "",
        bio: "",
        departmentId: "",
        positionId: "",
        managerId: "",
        isActive: true,
      });
    }
  }, [initialData, formType, defaultHireDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (localValidationErrors[name])
      setLocalValidationErrors((prev) => ({ ...prev, [name]: null }));
    if (serverValidationErrors[name]) {
      /* يمكنك اختيار إزالة خطأ الخادم أيضًا */
    }
  };

  // --- التحقق من صحة النموذج في الواجهة الأمامية (أساسي) ---
  const validateForm = () => {
    const errors = {};
    // User fields (only for 'add' mode)
    if (formType === "add") {
      if (!formData.username.trim())
        errors.username = t("validation.required", {
          field: t("auth.username"),
        });
      if (!formData.email.trim())
        errors.email = t("validation.required", { field: t("auth.email") });
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        errors.email = t("validation.invalidEmail");
      if (!formData.password)
        errors.password = t("validation.required", {
          field: t("auth.password"),
        });
      else if (formData.password.length < 6)
        errors.password = t("validation.minLength", {
          field: t("auth.password"),
          count: 6,
        });
      if (formData.password !== formData.confirmPassword)
        errors.confirmPassword = t("auth.passwordsDoNotMatch");
    }
    // Employee fields
    if (!formData.employeeCode.trim())
      errors.employeeCode = t("validation.required", {
        field: t("employees.form.employeeCode"),
      });
    if (!formData.firstName.trim())
      errors.firstName = t("validation.required", {
        field: t("auth.firstName"),
      });
    if (!formData.lastName.trim())
      errors.lastName = t("validation.required", { field: t("auth.lastName") });
    if (!formData.hireDate)
      errors.hireDate = t("validation.required", {
        field: t("employees.form.hireDate"),
      });
    if (!formData.departmentId)
      errors.departmentId = t("validation.required", {
        field: t("employees.table.department"),
      });
    if (!formData.positionId)
      errors.positionId = t("validation.required", {
        field: t("employees.table.position"),
      });

    // التحقق من experienceYears إذا تم إدخال قيمة
    if (
      formData.experienceYears &&
      isNaN(parseInt(formData.experienceYears.toString(), 10))
    ) {
      errors.experienceYears = t("validation.mustBeNumber", {
        field: t("employees.form.experienceYears"),
      });
    }

    setLocalValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let dataToSubmit = { ...formData };

    // تحويل experienceYears إلى رقم إذا لم يكن فارغًا
    if (dataToSubmit.experienceYears && dataToSubmit.experienceYears !== "") {
      dataToSubmit.experienceYears = parseInt(
        dataToSubmit.experienceYears.toString(),
        10
      );
    } else {
      dataToSubmit.experienceYears = null; // أو undefined إذا كانت API تتوقع ذلك
    }

    // تحويل السلاسل الفارغة للحقول الاختيارية إلى null
    [
      "middleName",
      "gender",
      "dateOfBirth",
      "nationality",
      "maritalStatus",
      "phoneNumber",
      "address",
      "city",
      "country",
      "employmentType",
      "profilePictureUrl",
      "jobTitleOverride",
      "bio",
      "managerId",
    ].forEach((field) => {
      if (dataToSubmit[field] === "") dataToSubmit[field] = null;
    });
    // تأكد من أن hireDate له قيمة دائمًا (مطلوب)
    if (dataToSubmit.hireDate === "") dataToSubmit.hireDate = defaultHireDate; // أو رمي خطأ إذا كان يجب ألا يكون فارغًا

    if (formType === "add") {
      delete dataToSubmit.confirmPassword;
      // roles يتم تعيينها افتراضيًا في الخادم عند إنشاء المستخدم المرتبط بالموظف
      // أو يمكنك إرسالها إذا أردت التحكم بها من هنا
      dataToSubmit.roles = ["USER"]; // مثال إذا كنت تريد إرسالها
    } else if (formType === "edit") {
      // لا نرسل هذه الحقول عادةً عند تعديل الموظف من هذا النموذج
      delete dataToSubmit.username;
      delete dataToSubmit.email;
      delete dataToSubmit.password;
      delete dataToSubmit.confirmPassword;
      delete dataToSubmit.roles;
    }

    console.log("Data being submitted to API:", dataToSubmit);
    onSubmit(dataToSubmit, formType === "edit" ? initialData?.id : null);
  };

  const getInputClass = (fieldName) =>
    `${inputBaseClasses} ${
      displayErrors[fieldName] ? inputErrorClasses : inputDefaultClasses
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 p-1 max-h-[75vh] overflow-y-auto custom-scrollbar"
      noValidate
    >
      <h3
        className={`text-xl font-semibold pb-3 mb-4 border-b border-slate-200 dark:border-slate-700 ${
          dir === "rtl" ? "text-right" : "text-left"
        } text-slate-800 dark:text-slate-100 sticky top-0 bg-white dark:bg-slate-800 z-10 py-4 -mx-1 px-1`}
      >
        {formType === "add"
          ? t("employees.addEmployeeTitle")
          : t("employees.editEmployeeTitle", {
              name: `${initialData?.firstName || ""} ${
                initialData?.lastName || ""
              }`.trim(),
            })}
      </h3>

      {/* قسم معلومات حساب المستخدم (فقط عند الإضافة) */}
      {formType === "add" && (
        <fieldset className={fieldsetClasses}>
          <legend className={legendClasses}>
            {t("employees.form.userInfo")}
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
            <div>
              <label htmlFor="username_form" className={labelClasses}>
                {t("auth.username")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                id="username_form"
                value={formData.username}
                onChange={handleChange}
                className={getInputClass("username")}
              />
              {displayErrors.username && (
                <p className={errorMessageClasses}>{displayErrors.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="email_form" className={labelClasses}>
                {t("auth.email")} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email_form"
                value={formData.email}
                onChange={handleChange}
                className={getInputClass("email")}
              />
              {displayErrors.email && (
                <p className={errorMessageClasses}>{displayErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password_form" className={labelClasses}>
                {t("auth.password")} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                id="password_form"
                value={formData.password}
                onChange={handleChange}
                className={getInputClass("password")}
              />
              {displayErrors.password && (
                <p className={errorMessageClasses}>{displayErrors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword_form" className={labelClasses}>
                {t("auth.confirmPassword")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword_form"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={getInputClass("confirmPassword")}
              />
              {displayErrors.confirmPassword && (
                <p className={errorMessageClasses}>
                  {displayErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </fieldset>
      )}

      {/* قسم معلومات الموظف الأساسية */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>
          {t("employees.form.employeeInfo")}
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mt-2">
          <div>
            <label htmlFor="employeeCode_form" className={labelClasses}>
              {t("employees.form.employeeCode")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="employeeCode"
              id="employeeCode_form"
              value={formData.employeeCode}
              onChange={handleChange}
              className={getInputClass("employeeCode")}
            />
            {displayErrors.employeeCode && (
              <p className={errorMessageClasses}>
                {displayErrors.employeeCode}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="firstName_form" className={labelClasses}>
              {t("auth.firstName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName_form"
              value={formData.firstName}
              onChange={handleChange}
              className={getInputClass("firstName")}
            />
            {displayErrors.firstName && (
              <p className={errorMessageClasses}>{displayErrors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="middleName_form" className={labelClasses}>
              {t("employees.form.middleName")}
            </label>
            <input
              type="text"
              name="middleName"
              id="middleName_form"
              value={formData.middleName}
              onChange={handleChange}
              className={getInputClass("middleName")}
            />
          </div>
          <div>
            <label htmlFor="lastName_form" className={labelClasses}>
              {t("auth.lastName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName_form"
              value={formData.lastName}
              onChange={handleChange}
              className={getInputClass("lastName")}
            />
            {displayErrors.lastName && (
              <p className={errorMessageClasses}>{displayErrors.lastName}</p>
            )}
          </div>
          <div>
            <label htmlFor="gender_form" className={labelClasses}>
              {t("employees.form.gender")}
            </label>
            <select
              name="gender"
              id="gender_form"
              value={formData.gender}
              onChange={handleChange}
              className={getInputClass("gender")}
            >
              <option value="">{t("employees.form.selectGender")}</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {t(`enums.gender.${g.toLowerCase()}`, { defaultValue: g })}
                </option>
              ))}
            </select>
            {displayErrors.gender && (
              <p className={errorMessageClasses}>{displayErrors.gender}</p>
            )}
          </div>
          <div>
            <label htmlFor="dateOfBirth_form" className={labelClasses}>
              {t("employees.form.dateOfBirth")}
            </label>
            <input
              type="date"
              name="dateOfBirth"
              id="dateOfBirth_form"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={getInputClass("dateOfBirth")}
            />
            {displayErrors.dateOfBirth && (
              <p className={errorMessageClasses}>{displayErrors.dateOfBirth}</p>
            )}
          </div>
          <div>
            <label htmlFor="nationality_form" className={labelClasses}>
              {t("employees.form.nationality")}
            </label>
            <input
              type="text"
              name="nationality"
              id="nationality_form"
              value={formData.nationality}
              onChange={handleChange}
              className={getInputClass("nationality")}
            />
          </div>
          <div>
            <label htmlFor="maritalStatus_form" className={labelClasses}>
              {t("employees.form.maritalStatus")}
            </label>
            <select
              name="maritalStatus"
              id="maritalStatus_form"
              value={formData.maritalStatus}
              onChange={handleChange}
              className={getInputClass("maritalStatus")}
            >
              <option value="">
                {t("employees.form.selectMaritalStatus")}
              </option>
              {MARITAL_STATUSES.map((ms) => (
                <option key={ms} value={ms}>
                  {t(`enums.maritalStatus.${ms.toLowerCase()}`, {
                    defaultValue: ms,
                  })}
                </option>
              ))}
            </select>
            {displayErrors.maritalStatus && (
              <p className={errorMessageClasses}>
                {displayErrors.maritalStatus}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="phoneNumber_form" className={labelClasses}>
              {t("employees.form.phoneNumber")}
            </label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber_form"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={getInputClass("phoneNumber")}
            />
            {displayErrors.phoneNumber && (
              <p className={errorMessageClasses}>{displayErrors.phoneNumber}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* قسم معلومات الوظيفة */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>{t("employees.form.jobInfo")}</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mt-2">
          <div>
            <label htmlFor="hireDate_form" className={labelClasses}>
              {t("employees.form.hireDate")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="hireDate"
              id="hireDate_form"
              value={formData.hireDate}
              onChange={handleChange}
              required
              className={getInputClass("hireDate")}
            />
            {displayErrors.hireDate && (
              <p className={errorMessageClasses}>{displayErrors.hireDate}</p>
            )}
          </div>
          <div>
            <label htmlFor="departmentId_form" className={labelClasses}>
              {t("employees.table.department")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              name="departmentId"
              id="departmentId_form"
              value={formData.departmentId}
              onChange={handleChange}
              required
              className={getInputClass("departmentId")}
              disabled={isDropdownLoading}
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {displayErrors.departmentId && (
              <p className={errorMessageClasses}>
                {displayErrors.departmentId}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="positionId_form" className={labelClasses}>
              {t("employees.table.position")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              name="positionId"
              id="positionId_form"
              value={formData.positionId}
              onChange={handleChange}
              required
              className={getInputClass("positionId")}
              disabled={isDropdownLoading}
            >
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name}
                </option>
              ))}
            </select>
            {displayErrors.positionId && (
              <p className={errorMessageClasses}>{displayErrors.positionId}</p>
            )}
          </div>
          <div>
            <label htmlFor="employmentType_form" className={labelClasses}>
              {t("employees.form.employmentType")}
            </label>
            <select
              name="employmentType"
              id="employmentType_form"
              value={formData.employmentType}
              onChange={handleChange}
              className={getInputClass("employmentType")}
            >
              <option value="">
                {t("employees.form.selectEmploymentType")}
              </option>
              {EMPLOYMENT_TYPES.map((et) => (
                <option key={et} value={et}>
                  {t(`enums.employmentType.${et.toLowerCase()}`, {
                    defaultValue: et,
                  })}
                </option>
              ))}
            </select>
            {displayErrors.employmentType && (
              <p className={errorMessageClasses}>
                {displayErrors.employmentType}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="status_form" className={labelClasses}>
              {t("employees.table.status")}
            </label>
            <select
              name="status"
              id="status_form"
              value={formData.status}
              onChange={handleChange}
              className={getInputClass("status")}
            >
              {EMPLOYEE_STATUSES.map((es) => (
                <option key={es} value={es}>
                  {t(`enums.employeeStatus.${es.toLowerCase()}`, {
                    defaultValue: es,
                  })}
                </option>
              ))}
            </select>
            {displayErrors.status && (
              <p className={errorMessageClasses}>{displayErrors.status}</p>
            )}
          </div>
          <div>
            <label htmlFor="managerId_form" className={labelClasses}>
              {t("employees.form.manager")}
            </label>
            <select
              name="managerId"
              id="managerId_form"
              value={formData.managerId}
              onChange={handleChange}
              className={getInputClass("managerId")}
              disabled={isDropdownLoading}
            >
              {managers.map((mgr) => (
                <option key={mgr.id} value={mgr.id}>
                  {mgr.name}
                </option>
              ))}
            </select>
            {displayErrors.managerId && (
              <p className={errorMessageClasses}>{displayErrors.managerId}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="jobTitleOverride_form" className={labelClasses}>
              {t("employees.form.jobTitleOverride")}
            </label>
            <input
              type="text"
              name="jobTitleOverride"
              id="jobTitleOverride_form"
              value={formData.jobTitleOverride}
              onChange={handleChange}
              className={getInputClass("jobTitleOverride")}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            {" "}
            {/* هذا الحقل قد يأخذ عرضًا أقل */}
            <label htmlFor="experienceYears_form" className={labelClasses}>
              {t("employees.form.experienceYears")}
            </label>
            <input
              type="number"
              name="experienceYears"
              id="experienceYears_form"
              value={formData.experienceYears}
              onChange={handleChange}
              className={getInputClass("experienceYears")}
              min="0"
            />
            {displayErrors.experienceYears && (
              <p className={errorMessageClasses}>
                {displayErrors.experienceYears}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* قسم معلومات إضافية */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>
          {t("employees.form.additionalInfo")}
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
          <div>
            <label htmlFor="address_form" className={labelClasses}>
              {t("employees.form.address")}
            </label>
            <input
              type="text"
              name="address"
              id="address_form"
              value={formData.address}
              onChange={handleChange}
              className={getInputClass("address")}
            />
          </div>
          <div>
            <label htmlFor="city_form" className={labelClasses}>
              {t("employees.form.city")}
            </label>
            <input
              type="text"
              name="city"
              id="city_form"
              value={formData.city}
              onChange={handleChange}
              className={getInputClass("city")}
            />
          </div>
          <div>
            <label htmlFor="country_form" className={labelClasses}>
              {t("employees.form.country")}
            </label>
            <input
              type="text"
              name="country"
              id="country_form"
              value={formData.country}
              onChange={handleChange}
              className={getInputClass("country")}
            />
          </div>
          {/* حقل رفع صورة الملف الشخصي (يتطلب معالجة خاصة للملفات) */}
          <div>
            <label htmlFor="profilePictureUrl_form" className={labelClasses}>
              {t("employees.form.profilePictureUrl", {
                defaultValue: "Profile Picture URL",
              })}
            </label>
            <input
              type="url"
              name="profilePictureUrl"
              id="profilePictureUrl_form"
              value={formData.profilePictureUrl}
              onChange={handleChange}
              className={getInputClass("profilePictureUrl")}
              placeholder="https://example.com/image.png"
            />
            {displayErrors.profilePictureUrl && (
              <p className={errorMessageClasses}>
                {displayErrors.profilePictureUrl}
              </p>
            )}
            {/* لاحقًا: استبدل هذا بحقل <input type="file" /> ومعالجة رفع الملفات */}
          </div>
        </div>
        <div className="mt-3">
          <label htmlFor="bio_form" className={labelClasses}>
            {t("employees.form.bio")}
          </label>
          <textarea
            name="bio"
            id="bio_form"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
            className={getInputClass("bio")}
          ></textarea>
        </div>
      </fieldset>

      {/* أزرار الإرسال والإلغاء */}
      <div
        className={`flex pt-5 pb-1 ${
          dir === "rtl"
            ? "justify-start space-x-reverse space-x-3"
            : "justify-end space-x-3"
        }`}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t("cancel")}
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading
            ? t("saving")
            : formType === "add"
            ? t("employees.form.addEmployeeButton")
            : t("employees.form.saveChangesButton")}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
