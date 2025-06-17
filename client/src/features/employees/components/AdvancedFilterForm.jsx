// src/features/employees/components/AdvancedFilterForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import axiosInstance from "../../../config/axiosInstance"; // إذا كنت ستجلب قوائم منسدلة للفلاتر

const inputBaseClasses =
  "w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm";
const labelClasses =
  "block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
const inputDefaultClasses =
  "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500/50";

const AdvancedFilterForm = ({ activeFilters, onApplyFilters, onClose }) => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    email: "", // من User model
    phoneNumber: "",
    departmentId: "",
    positionId: "",
    status: "", // EmployeeStatus
    // يمكنك إضافة المزيد من الحقول هنا
    // country: '',
    // gender: '',
    // hireDateFrom: '',
    // hireDateTo: '',
  });

  // حالات للقوائم المنسدلة للفلاتر
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  // ... (يمكنك إضافة المزيد مثل EmployeeStatuses إذا أردت جلبها من API بدلاً من تعريفها يدويًا)

  // املأ النموذج بقيم الفلاتر النشطة عند فتحه
  useEffect(() => {
    setFilters((prev) => ({
      ...prev, // احتفظ بالقيم الافتراضية للحقول غير الموجودة في activeFilters
      firstName: activeFilters.firstName || "",
      lastName: activeFilters.lastName || "",
      email: activeFilters.email || "",
      phoneNumber: activeFilters.phoneNumber || "",
      departmentId: activeFilters.departmentId || "",
      positionId: activeFilters.positionId || "",
      status: activeFilters.status || "",
    }));
  }, [activeFilters]);

  // جلب بيانات القوائم المنسدلة للفلاتر
  useEffect(() => {
    const fetchFilterDropdowns = async () => {
      try {
        const [deptsRes, posRes] = await Promise.all([
          axiosInstance.get("/departments/for-select"),
          axiosInstance.get("/positions/for-select"), // قد لا تحتاج لتصفية حسب القسم هنا
        ]);
        if (deptsRes.data.success) {
          setDepartments([
            {
              id: "",
              name: t("employees.filter.allDepartments", {
                defaultValue: "All Departments",
              }),
            },
            ...deptsRes.data.data,
          ]);
        }
        if (posRes.data.success) {
          setPositions([
            {
              id: "",
              name: t("employees.filter.allPositions", {
                defaultValue: "All Positions",
              }),
            },
            ...posRes.data.data.map((p) => ({
              id: p.id,
              name: p.title || p.name,
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch filter dropdown data:", error);
      }
    };
    fetchFilterDropdowns();
  }, [t]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = (e) => {
    e.preventDefault();
    // إزالة الحقول الفارغة من الفلاتر قبل الإرسال
    const cleanFilters = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "") {
        cleanFilters[key] = filters[key];
      }
    });
    onApplyFilters(cleanFilters);
    onClose(); // أغلق نافذة الفلترة بعد التطبيق
  };

  const handleReset = () => {
    setFilters({
      /* ... قيم فارغة ... */ firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      departmentId: "",
      positionId: "",
      status: "",
    });
    onApplyFilters({}); // تطبيق فلاتر فارغة (إعادة تعيين)
    // onClose(); // (اختياري) أغلق عند إعادة التعيين
  };

  // --- تعريف قيم Enum يدويًا (كما في EmployeeForm) ---
  const EMPLOYEE_STATUSES = [
    "ACTIVE",
    "ON_LEAVE",
    "TERMINATED",
    "RESIGNED",
    "PROBATION",
  ]; // أضف خيار "الكل" (سلسلة فارغة)

  return (
    <div className="mt-4 p-4 border-t border-slate-200 dark:border-slate-700">
      <form onSubmit={handleApply} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* حقل الاسم الأول */}
          <div>
            <label htmlFor="filter_firstName" className={labelClasses}>
              {t("auth.firstName")}
            </label>
            <input
              type="text"
              name="firstName"
              id="filter_firstName"
              value={filters.firstName}
              onChange={handleChange}
              className={`${inputBaseClasses} ${inputDefaultClasses}`}
            />
          </div>
          {/* حقل اسم العائلة */}
          <div>
            <label htmlFor="filter_lastName" className={labelClasses}>
              {t("auth.lastName")}
            </label>
            <input
              type="text"
              name="lastName"
              id="filter_lastName"
              value={filters.lastName}
              onChange={handleChange}
              className={`${inputBaseClasses} ${inputDefaultClasses}`}
            />
          </div>
          {/* حقل البريد الإلكتروني */}
          <div>
            <label htmlFor="filter_email" className={labelClasses}>
              {t("auth.email")}
            </label>
            <input
              type="text"
              name="email"
              id="filter_email"
              value={filters.email}
              onChange={handleChange}
              className={`${inputBaseClasses} ${inputDefaultClasses}`}
            />
          </div>
          {/* حقل رقم الهاتف */}
          <div>
            <label htmlFor="filter_phoneNumber" className={labelClasses}>
              {t("employees.form.phoneNumber")}
            </label>
            <input
              type="text"
              name="phoneNumber"
              id="filter_phoneNumber"
              value={filters.phoneNumber}
              onChange={handleChange}
              className={`${inputBaseClasses} ${inputDefaultClasses}`}
            />
          </div>
          {/* فلتر القسم */}
          <div>
            <label htmlFor="filter_departmentId" className={labelClasses}>
              {t("employees.table.department")}
            </label>
            <select
              name="departmentId"
              id="filter_departmentId"
              value={filters.departmentId}
              onChange={handleChange}
              className={`${inputBaseClasses} ${inputDefaultClasses}`}
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          {/* فلتر المنصب */}
          <div>
            <label htmlFor="filter_positionId" className={labelClasses}>
              {t("employees.table.position")}
            </label>
            <select
              name="positionId"
              id="filter_positionId"
              value={filters.positionId}
              onChange={handleChange}
              className={`${inputBaseClasses} ${inputDefaultClasses}`}
            >
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name}
                </option>
              ))}
            </select>
          </div>
          {/* فلتر الحالة */}
          <div>
            <label htmlFor="filter_status" className={labelClasses}>
              {t("employees.table.status")}
            </label>
            <select
              name="status"
              id="filter_status"
              value={filters.status}
              onChange={handleChange}
              className={`${inputBaseClasses} ${inputDefaultClasses}`}
            >
              <option value="">
                {t("employees.filter.allStatuses", {
                  defaultValue: "All Statuses",
                })}
              </option>
              {EMPLOYEE_STATUSES.map(
                (
                  s //  <-- هل استخدمت هذا المتغير؟
                ) => (
                  <option key={s || "all-status"} value={s}>
                    {" "}
                    {/* استخدم s || 'all-status' كمفتاح إذا كان s فارغًا */}
                    {s
                      ? t(`enums.employeeStatus.${s.toLowerCase()}`, {
                          defaultValue: s,
                        })
                      : t("employees.filter.allStatuses", {
                          defaultValue: "All Statuses",
                        })}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
        <div
          className={`flex pt-3 ${
            dir === "rtl"
              ? "justify-start space-x-reverse space-x-3"
              : "justify-end space-x-3"
          }`}
        >
          <Button type="button" variant="outline" onClick={handleReset}>
            {t("resetFilters", { defaultValue: "Reset Filters" })}
          </Button>
          <Button type="submit" variant="primary">
            {t("applyFilters", { defaultValue: "Apply Filters" })}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedFilterForm;
