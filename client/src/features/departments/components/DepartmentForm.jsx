// src/features/departments/components/DepartmentForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button"; // افترض أن لديك هذا المكون
import axiosInstance from "../../../config/axiosInstance"; // لجلب المديرين والأقسام الأصل

// --- كلاسات CSS المساعدة (يمكنك وضعها في ملف عام) ---
const inputBaseClasses =
  "w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm";
const inputDefaultClasses =
  "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500/50";
const inputErrorClasses =
  "border-red-500 dark:border-red-600 focus:ring-red-500/50 text-red-700 dark:text-red-300 placeholder-red-400 dark:placeholder-red-500";
const labelClasses =
  "block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
const errorMessageClasses = "text-xs text-red-600 dark:text-red-400 mt-1";
// const fieldsetClasses = "border dark:border-slate-600 p-4 rounded-lg";
// const legendClasses =
//   "text-md font-semibold px-2 text-sky-600 dark:text-sky-400";

const DepartmentForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  formType = "add",
  serverValidationErrors = {},
}) => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    parentDepartmentId: "", // يمكن أن يكون null أو فارغًا
    managerId: "", // يمكن أن يكون null أو فارغًا
    isActive: true,
  });

  const [localValidationErrors, setLocalValidationErrors] = useState({});
  const displayErrors = { ...localValidationErrors, ...serverValidationErrors };

  // --- حالات للقوائم المنسدلة ---
  const [parentDepartments, setParentDepartments] = useState([]); // ستبدأ فارغة ثم تُملأ
  const [potentialManagers, setPotentialManagers] = useState([]);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);

  // --- جلب بيانات القوائم المنسدلة ---
  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsDropdownLoading(true);
      try {
        const [deptsRes, empsRes] = await Promise.all([
          axiosInstance.get("/departments/for-select"),
          axiosInstance.get("/employees/for-manager-select"),
        ]);

        if (deptsRes.data.success) {
          let filteredDepts = deptsRes.data.data;
          // تصفية القسم الحالي من قائمة الآباء المحتملين (لا يمكن للقسم أن يكون أبًا لنفسه)
          if (formType === "edit" && initialData?.id) {
            filteredDepts = deptsRes.data.data.filter(
              (dept) => dept.id !== initialData.id
            );
          }
          // ✅ إضافة الخيار الافتراضي هنا
          setParentDepartments([
            {
              id: "",
              name: t("departments.form.selectParentOptional", {
                defaultValue: "-- No Parent (Root Level) --",
              }),
            },
            ...filteredDepts,
          ]);
        } else {
          // وضع خيار افتراضي حتى في حالة الفشل
          setParentDepartments([
            {
              id: "",
              name: t("departments.form.selectParentOptional", {
                defaultValue: "-- No Parent (Root Level) --",
              }),
            },
          ]);
        }

        if (empsRes.data.success) {
          setPotentialManagers([
            {
              id: "",
              name: t("departments.form.selectManagerOptional", {
                defaultValue: "-- No Manager Assigned --",
              }),
            },
            ...empsRes.data.data,
          ]);
        } else {
          setPotentialManagers([
            {
              id: "",
              name: t("departments.form.selectManagerOptional", {
                defaultValue: "-- No Manager Assigned --",
              }),
            },
          ]);
        }
      } catch (error) {
        console.error(
          "Failed to fetch dropdown data for department form:",
          error
        );
        // وضع خيارات افتراضية عند الخطأ
        setParentDepartments([
          {
            id: "",
            name: t("departments.form.selectParentOptional", {
              defaultValue: "-- No Parent (Root Level) --",
            }),
          },
        ]);
        setPotentialManagers([
          {
            id: "",
            name: t("departments.form.selectManagerOptional", {
              defaultValue: "-- No Manager Assigned --",
            }),
          },
        ]);
      } finally {
        setIsDropdownLoading(false);
      }
    };
    fetchDropdownData();
  }, [t, initialData?.id, formType]); // الاعتماد على formType أيضًا لضمان تحديث القائمة بشكل صحيح

  // --- ملء النموذج بالبيانات الأولية عند التعديل ---
  useEffect(() => {
    if (formType === "edit" && initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        description: initialData.description || "",
        // ✅ تأكد أن parentDepartmentId هو سلسلة فارغة إذا كان null/undefined في initialData
        parentDepartmentId: initialData.parentDepartmentId || "",
        managerId: initialData.managerId || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else if (formType === "add") {
      // إعادة تعيين صريحة عند الإضافة
      setFormData({
        name: "",
        code: "",
        description: "",
        parentDepartmentId: "",
        managerId: "",
        isActive: true,
      });
    }
  }, [initialData, formType]); // الاعتماد على formType أيضًا

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (localValidationErrors[name])
      setLocalValidationErrors((prev) => ({ ...prev, [name]: null }));
  };

  // --- التحقق الأولي في الواجهة الأمامية ---
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim())
      errors.name = t("validation.required", {
        field: t("departments.form.name"),
      });
    // يمكنك إضافة المزيد من التحققات إذا لزم الأمر (مثل طول الكود، إلخ)
    setLocalValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dataToSubmit = { ...formData };
    if (dataToSubmit.code === "") dataToSubmit.code = null;
    if (dataToSubmit.description === "") dataToSubmit.description = null;
    // ✅ إذا كانت القيمة ''، أرسل null (Prisma يتوقع null للحقول الاختيارية غير المعينة)
    if (dataToSubmit.parentDepartmentId === "")
      dataToSubmit.parentDepartmentId = null;
    if (dataToSubmit.managerId === "") dataToSubmit.managerId = null;

    console.log("Submitting department data:", dataToSubmit);
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
          ? t("departments.addDepartmentTitle")
          : t("departments.editDepartmentTitle", {
              name: initialData?.name || "",
            })}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="dept_name" className={labelClasses}>
            {t("departments.form.name")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="dept_name"
            value={formData.name}
            onChange={handleChange}
            className={getInputClass("name")}
          />
          {displayErrors.name && (
            <p className={errorMessageClasses}>{displayErrors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="dept_code" className={labelClasses}>
            {t("departments.form.code")}
          </label>
          <input
            type="text"
            name="code"
            id="dept_code"
            value={formData.code || ""}
            onChange={handleChange}
            className={getInputClass("code")}
          />
          {displayErrors.code && (
            <p className={errorMessageClasses}>{displayErrors.code}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="dept_description" className={labelClasses}>
            {t("departments.form.description")}
          </label>
          <textarea
            name="description"
            id="dept_description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={getInputClass("description")}
          ></textarea>
          {displayErrors.description && (
            <p className={errorMessageClasses}>{displayErrors.description}</p>
          )}
        </div>
        <div>
          <label htmlFor="dept_parentDepartmentId" className={labelClasses}>
            {t("departments.form.parentDepartment")}
          </label>
          <select
            name="parentDepartmentId"
            id="dept_parentDepartmentId"
            value={formData.parentDepartmentId || ""}
            onChange={handleChange}
            className={getInputClass("parentDepartmentId")}
            disabled={isDropdownLoading}
          >
            {parentDepartments.map((dept) => (
              <option key={dept.id || "on-parent"} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {displayErrors.parentDepartmentId && (
            <p className={errorMessageClasses}>
              {displayErrors.parentDepartmentId}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="dept_managerId" className={labelClasses}>
            {t("departments.form.manager")}
          </label>
          <select
            name="managerId"
            id="dept_managerId"
            value={formData.managerId || ""}
            onChange={handleChange}
            className={getInputClass("managerId")}
            disabled={isDropdownLoading}
          >
            {potentialManagers.map((mgr) => (
              <option key={mgr.id || "no-manager"} value={mgr.id}>
                {mgr.name}
              </option>
            ))}
          </select>
          {displayErrors.managerId && (
            <p className={errorMessageClasses}>{displayErrors.managerId}</p>
          )}
        </div>
        <div className="md:col-span-2 flex items-center mt-2">
          <input
            type="checkbox"
            name="isActive"
            id="dept_isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600"
          />
          <label
            htmlFor="dept_isActive"
            className={`${
              dir === "rtl" ? "mr-2" : "ml-2"
            } text-sm text-slate-700 dark:text-slate-300`}
          >
            {t("departments.form.isActive", {
              defaultValue: "Active Department",
            })}
          </label>
        </div>
      </div>

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
            ? t("departments.form.addDepartmentButton")
            : t("departments.form.saveChangesButton")}
        </Button>
      </div>
    </form>
  );
};

export default DepartmentForm;
