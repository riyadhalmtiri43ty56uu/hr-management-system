// src/features/departments/components/PositionForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import axiosInstance from "../../../config/axiosInstance";

// --- كلاسات CSS المساعدة (يمكنك وضعها في ملف عام أو استخدام Tailwind مباشرة) ---
const inputBaseClasses =
  "w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm";
const inputDefaultClasses =
  "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500/50";
const inputErrorClasses =
  "border-red-500 dark:border-red-600 focus:ring-red-500/50 text-red-700 dark:text-red-300 placeholder-red-400 dark:placeholder-red-500";
const labelClasses =
  "block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
const errorMessageClasses = "text-xs text-red-600 dark:text-red-400 mt-1";

const PositionForm = ({
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
    title: "",
    code: "",
    description: "",
    departmentId: "", // مهم: الوظيفة يجب أن تنتمي لقسم
    jobLevel: "",
    baseSalaryMin: "",
    baseSalaryMax: "",
    isActive: true,
  });

  const [localValidationErrors, setLocalValidationErrors] = useState({});
  const displayErrors = { ...localValidationErrors, ...serverValidationErrors };

  const [departments, setDepartments] = useState([]);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);

  // جلب قائمة الأقسام لاختيار القسم الذي تنتمي إليه الوظيفة
  useEffect(() => {
    const fetchDepartmentsForSelect = async () => {
      setIsDropdownLoading(true);
      try {
        const response = await axiosInstance.get("/departments/for-select");
        if (response.data.success) {
          setDepartments([
            {
              id: "",
              name: t("positions.form.selectDepartment", {
                defaultValue: "-- Select Department --",
              }),
            },
            ...response.data.data,
          ]);
        } else {
          setDepartments([
            {
              id: "",
              name: t("positions.form.selectDepartment", {
                defaultValue: "-- Select Department --",
              }),
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch departments for position form:", error);
        setDepartments([
          {
            id: "",
            name: t("positions.form.selectDepartment", {
              defaultValue: "-- Select Department --",
            }),
          },
        ]);
      } finally {
        setIsDropdownLoading(false);
      }
    };
    fetchDepartmentsForSelect();
  }, [t]);

  useEffect(() => {
    if (formType === "edit" && initialData) {
      setFormData({
        title: initialData.title || "",
        code: initialData.code || "",
        description: initialData.description || "",
        departmentId:
          initialData.departmentId || initialData.department?.id || "", // تأكد من الحصول على ID القسم
        jobLevel: initialData.jobLevel || "",
        baseSalaryMin: initialData.baseSalaryMin || "",
        baseSalaryMax: initialData.baseSalaryMax || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else if (formType === "add") {
      setFormData({
        title: "",
        code: "",
        description: "",
        departmentId: "",
        jobLevel: "",
        baseSalaryMin: "",
        baseSalaryMax: "",
        isActive: true,
      });
    }
  }, [initialData, formType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (localValidationErrors[name])
      setLocalValidationErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim())
      errors.title = t("validation.required", {
        field: t("positions.form.title"),
      });
    if (!formData.departmentId)
      errors.departmentId = t("validation.required", {
        field: t("departments.form.name"),
      }); // اسم الحقل 'القسم'

    if (formData.baseSalaryMin && isNaN(parseFloat(formData.baseSalaryMin))) {
      errors.baseSalaryMin = t("validation.mustBeNumber", {
        field: t("positions.form.baseSalaryMin"),
      });
    }
    if (formData.baseSalaryMax && isNaN(parseFloat(formData.baseSalaryMax))) {
      errors.baseSalaryMax = t("validation.mustBeNumber", {
        field: t("positions.form.baseSalaryMax"),
      });
    }
    if (
      formData.baseSalaryMin &&
      formData.baseSalaryMax &&
      parseFloat(formData.baseSalaryMin) > parseFloat(formData.baseSalaryMax)
    ) {
      errors.baseSalaryMax = t("validation.minMaxSalary", {
        defaultValue: "Max salary must be greater than or equal to min salary.",
      });
    }

    setLocalValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dataToSubmit = { ...formData };
    // تحويل السلاسل الفارغة إلى null للحقول الاختيارية
    ["code", "description", "jobLevel"].forEach((field) => {
      if (dataToSubmit[field] === "") dataToSubmit[field] = null;
    });
    // تحويل حقول الراتب إلى أرقام أو null
    ["baseSalaryMin", "baseSalaryMax"].forEach((field) => {
      if (dataToSubmit[field] && dataToSubmit[field] !== "") {
        dataToSubmit[field] = parseFloat(dataToSubmit[field]);
      } else {
        dataToSubmit[field] = null;
      }
    });

    console.log("Submitting position data:", dataToSubmit);
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
          ? t("positions.addPositionTitle")
          : t("positions.editPositionTitle", {
              title: initialData?.title || "",
            })}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="pos_title" className={labelClasses}>
            {t("positions.form.title")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="pos_title"
            value={formData.title}
            onChange={handleChange}
            className={getInputClass("title")}
          />
          {displayErrors.title && (
            <p className={errorMessageClasses}>{displayErrors.title}</p>
          )}
        </div>
        <div>
          <label htmlFor="pos_code" className={labelClasses}>
            {t("positions.form.code")}
          </label>
          <input
            type="text"
            name="code"
            id="pos_code"
            value={formData.code || ""}
            onChange={handleChange}
            className={getInputClass("code")}
          />
          {displayErrors.code && (
            <p className={errorMessageClasses}>{displayErrors.code}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="pos_departmentId" className={labelClasses}>
            {t("departments.form.name")} <span className="text-red-500">*</span>
          </label>
          <select
            name="departmentId"
            id="pos_departmentId"
            value={formData.departmentId}
            onChange={handleChange}
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
            <p className={errorMessageClasses}>{displayErrors.departmentId}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="pos_description" className={labelClasses}>
            {t("positions.form.description")}
          </label>
          <textarea
            name="description"
            id="pos_description"
            value={formData.description || ""}
            onChange={handleChange}
            rows="3"
            className={getInputClass("description")}
          ></textarea>
          {displayErrors.description && (
            <p className={errorMessageClasses}>{displayErrors.description}</p>
          )}
        </div>
        <div>
          <label htmlFor="pos_jobLevel" className={labelClasses}>
            {t("positions.form.jobLevel")}
          </label>
          <input
            type="text"
            name="jobLevel"
            id="pos_jobLevel"
            value={formData.jobLevel || ""}
            onChange={handleChange}
            className={getInputClass("jobLevel")}
          />
        </div>
        <div>
          <label htmlFor="pos_baseSalaryMin" className={labelClasses}>
            {t("positions.form.baseSalaryMin")}
          </label>
          <input
            type="number"
            name="baseSalaryMin"
            id="pos_baseSalaryMin"
            value={formData.baseSalaryMin || ""}
            onChange={handleChange}
            className={getInputClass("baseSalaryMin")}
            step="any"
            min="0"
          />
          {displayErrors.baseSalaryMin && (
            <p className={errorMessageClasses}>{displayErrors.baseSalaryMin}</p>
          )}
        </div>
        <div>
          <label htmlFor="pos_baseSalaryMax" className={labelClasses}>
            {t("positions.form.baseSalaryMax")}
          </label>
          <input
            type="number"
            name="baseSalaryMax"
            id="pos_baseSalaryMax"
            value={formData.baseSalaryMax || ""}
            onChange={handleChange}
            className={getInputClass("baseSalaryMax")}
            step="any"
            min="0"
          />
          {displayErrors.baseSalaryMax && (
            <p className={errorMessageClasses}>{displayErrors.baseSalaryMax}</p>
          )}
        </div>
        <div className="md:col-span-2 flex items-center mt-2">
          <input
            type="checkbox"
            name="isActive"
            id="pos_isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600"
          />
          <label
            htmlFor="pos_isActive"
            className={`${
              dir === "rtl" ? "mr-2" : "ml-2"
            } text-sm text-slate-700 dark:text-slate-300`}
          >
            {t("positions.form.isActive", { defaultValue: "Active Position" })}
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
            ? t("positions.addPositionButton")
            : t("positions.form.saveChangesButton")}
        </Button>
      </div>
    </form>
  );
};

export default PositionForm;
