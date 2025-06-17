// src/features/employees/pages/EmployeeListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../../config/axiosInstance";
import {
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaPlus,
  FaUsers,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight, // أيقونات أفضل للتقسيم
  FaListUl,
  FaThLarge, // <-- هل تم استيراد هاتين الأيقونتين؟
  FaFilter,
} from "react-icons/fa";
import Modal from "../../../components/ui/Modal";
import EmployeeForm from "../components/EmployeeForm";
import Button from "../../../components/ui/Button";
import EmployeeCard from "../components/EmployeeCard"; //  <-- استيراد مكون البطاقة
// سنستخدم <input> HTML عادي الآن، يمكنك استبداله بمكون Input مخصص لاحقًا
// import Input from '../../../components/ui/Input';

// --- كلاسات CSS للمدخلات (إذا لم تكن معرفة بشكل عام) ---
const inputBaseClasses =
  "w-96 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm";
const labelClasses =
  "block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
const inputDefaultClasses =
  "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500/50";
// const inputErrorClasses = "border-red-500 ..."; // افترض أنها معرفة في EmployeeForm

const EmployeeListPage = () => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10); // يمكنك جعل هذا قابلاً للتعديل من قبل المستخدم
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // داخل EmployeeListPage
  const [activeFilters, setActiveFilters] = useState({
    // departmentId: '', // مثال
    // positionId: '',
    // status: '',
    // ... أي فلاتر أخرى من النموذج المتقدم
  });
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false); // لإظهار/إخفاء نافذة الفلترة
  const [viewMode, setViewMode] = useState("list"); // 'grid' or 'list'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [serverSideFormErrors, setServerSideFormErrors] = useState({});

  // --- دالة جلب الموظفين ---
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: limit,
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: searchTerm.trim() || undefined, // أرسل undefined إذا كان البحث فارغًا

        ...activeFilters, // هذا سيفكك كائن activeFilters (مثل { departmentId: '123', status: 'ACTIVE' })
      };
      // إزالة المعاملات الفارغة أو null أو undefined
      Object.keys(params).forEach(
        (key) =>
          (params[key] === "" ||
            params[key] === null ||
            params[key] === undefined) &&
          delete params[key]
      );

      const response = await axiosInstance.get("/employees", { params });

      if (response.data && response.data.success) {
        setEmployees(response.data.data);
        if (response.data.meta && response.data.meta.pagination) {
          const {
            totalPages,
            totalRecords,
            currentPage: apiCurrentPage,
          } = response.data.meta.pagination;
          setPaginationInfo({
            totalPages,
            totalRecords,
            currentPage: apiCurrentPage,
            hasNextPage: apiCurrentPage < totalPages,
            hasPrevPage: apiCurrentPage > 1,
          });
        } else {
          setPaginationInfo({
            totalPages: Math.ceil(response.data.data.length / limit) || 1,
            totalRecords: response.data.data.length,
            currentPage: 1,
            hasNextPage:
              (Math.ceil(response.data.data.length / limit) || 1) > 1,
            hasPrevPage: false,
          });
        }
      } else {
        setError(response.data.message || t("employees.errorFetching"));
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError(
        err.response?.data?.message || t("employees.errorFetchingNetwork")
      );
    } finally {
      setIsLoading(false);
    }
  }, [t, currentPage, limit, sortBy, sortOrder, searchTerm, activeFilters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // --- دوال المودال ---
  const openModalForAdd = () => {
    setCurrentEmployee(null);
    setModalMode("add");
    setServerSideFormErrors({});
    setIsModalOpen(true);
  };
  const openModalForEdit = async (employeeSummary) => {
    // إذا كانت employeeSummary لا تحتوي على كل التفاصيل (مثل user.email)
    // قد تحتاج لجلب التفاصيل الكاملة للموظف هنا قبل فتح المودال
    // للتبسيط الآن، نفترض أن employeeSummary كافية أو أن EmployeeForm سيتعامل معها
    setIsSubmitting(true); // استخدم isSubmitting كحالة تحميل لفتح المودال أيضًا
    try {
      const response = await axiosInstance.get(
        `/employees/${employeeSummary.id}`
      );
      if (response.data.success) {
        setCurrentEmployee(response.data.data);
        setModalMode("edit");
        setServerSideFormErrors({});
        setIsModalOpen(true);
      } else {
        setError(
          response.data.message ||
            t("errors.failedToFetchDetails", {
              defaultValue: "Failed to fetch employee details.",
            })
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || t("errors.failedToFetchDetails"));
    } finally {
      setIsSubmitting(false);
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEmployee(null);
    setServerSideFormErrors({});
  };

  // --- دوال CRUD ---
  const handleFormSubmit = async (formDataFromForm, employeeIdToUpdate) => {
    setIsSubmitting(true);
    setError(null);
    setServerSideFormErrors({});
    try {
      if (modalMode === "add") {
        await axiosInstance.post("/employees", formDataFromForm);
        alert(t("employees.addSuccess"));
      } else if (modalMode === "edit" && employeeIdToUpdate) {
        await axiosInstance.put(
          `/employees/${employeeIdToUpdate}`,
          formDataFromForm
        );
        alert(t("employees.updateSuccess"));
      }
      closeModal();
      fetchEmployees(); // أعد تحميل القائمة لتشمل التغييرات
    } catch (err) {
      const apiErrorData = err.response?.data;
      if (apiErrorData) {
        if (
          apiErrorData.errors &&
          Array.isArray(apiErrorData.errors) &&
          apiErrorData.errors.length > 0
        ) {
          const fieldErrors = {};
          apiErrorData.errors.forEach((fieldErr) => {
            const fieldName = fieldErr.path.split(".").pop();
            if (fieldName) fieldErrors[fieldName] = fieldErr.message;
          });
          setServerSideFormErrors(fieldErrors);
        } else if (apiErrorData.message) {
          setError(apiErrorData.message); // خطأ عام يعرض فوق الجدول
        } else {
          setError(
            t(`employees.error${modalMode === "add" ? "Adding" : "Updating"}`)
          );
        }
      } else {
        setError(t("auth.networkError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (window.confirm(t("employees.confirmDelete", { name: employeeName }))) {
      setIsLoading(true); // أو حالة تحميل خاصة للحذف
      try {
        await axiosInstance.delete(`/employees/${employeeId}`);
        alert(t("employees.deleteSuccess"));
        fetchEmployees();
      } catch (err) {
        alert(
          `${t("error")}: ${
            err.response?.data?.message || t("employees.errorDeleting")
          }`
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- دوال التحكم ---
  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e) => {
    // دالة منفصلة لتحديث البحث
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    // useEffect للبحث المؤجل (debounce)
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== undefined) {
        // تحقق أن searchTerm ليس undefined
        setCurrentPage(1); // أعد التعيين للصفحة الأولى عند تغيير مصطلح البحث
        // fetchEmployees سيتم استدعاؤه تلقائيًا لأن searchTerm في اعتماديات fetchEmployees
      }
    }, 500); // تأخير 500ms
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const goToPage = (pageNumber) => {
    if (
      pageNumber >= 1 &&
      pageNumber <= paginationInfo.totalPages &&
      pageNumber !== currentPage
    ) {
      setCurrentPage(pageNumber);
    }
  };

  const canManage = true; // صلاحيات مؤقتة

  // --- مكون رأس الجدول القابل للفرز ---
  const SortableHeader = ({ columnKey, labelKey, align = "left" }) => {
    const isCurrentSortColumn = sortBy === columnKey;
    const textAlignClass =
      align === "center"
        ? "text-center"
        : dir === "rtl"
        ? "text-right"
        : "text-left";
    return (
      <th
        scope="col"
        className={`px-4 sm:px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors ${textAlignClass}`}
        onClick={() => handleSort(columnKey)}
        aria-sort={
          isCurrentSortColumn
            ? sortOrder === "asc"
              ? "ascending"
              : "descending"
            : "none"
        }
      >
        <div
          className={`flex items-center ${
            align === "center"
              ? "justify-center"
              : dir === "rtl"
              ? "justify-end"
              : "justify-start"
          }`}
        >
          <span>{t(labelKey)}</span>
          <span
            className={`inline-block ${dir === "rtl" ? "mr-1.5" : "ml-1.5"}`}
          >
            {isCurrentSortColumn ? (
              sortOrder === "asc" ? (
                <FaSortUp className="text-sky-500 dark:text-sky-400" />
              ) : (
                <FaSortDown className="text-sky-500 dark:text-sky-400" />
              )
            ) : (
              <FaSort className="text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400" />
            )}
          </span>
        </div>
      </th>
    );
  };

  // --- دالة لعرض تفاصيل الموظف (يمكن أن تفتح مودالاً آخر أو توجه لصفحة) ---
  const handleViewEmployee = (employee) => {
    // للتبسيط الآن، سنقوم فقط بطباعة معلومات الموظف
    // لاحقًا، يمكنك فتح مودال تفاصيل أو التوجيه إلى صفحة /employees/view/:id
    console.log("View employee:", employee);
    alert(
      `View details for: ${employee.firstName} ${employee.lastName}\n(Implement detail view modal/page)`
    );
  };

  if (isLoading && employees.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
        <p
          className={`text-lg ${
            dir === "rtl" ? "mr-4" : "ml-4"
          } text-slate-600 dark:text-slate-400`}
        >
          {t("loading")}
        </p>
      </div>
    );
  }
  // لا تعرض الخطأ إذا كان المودال مفتوحًا والخطأ يتعلق بالنموذج
  if (error && !isLoading && !isModalOpen) {
    return (
      <div className="p-6 my-6 bg-red-100 dark:bg-red-900/40 border border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl shadow-md">
        <h3 className="font-semibold text-lg mb-2">{t("error")}</h3>
        <p>{error}</p>
        <Button
          variant="outline"
          color="red"
          onClick={fetchEmployees}
          className="mt-4"
        >
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    // داخل return لـ EmployeeListPage، فوق الجدول/البطاقات
    <div className="container mx-auto p-4 sm:p-6">
      {/* العنوان وزر الإضافة */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          {t("employees.employeeListTitle")}
        </h1>
        {canManage && (
          <Button
            variant="primary"
            onClick={openModalForAdd}
            className="shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <FaPlus className={`${dir === "rtl" ? "ml-2" : "mr-2"}`} />
            {t("employees.addEmployee")}
          </Button>
        )}
      </div>

      {/* رسالة الخطأ */}
      {error && !isSubmitting && (
        <div className="p-4 mb-6 bg-red-100 dark:bg-red-900/40 border border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl shadow-md">
          <h3 className="font-semibold text-lg mb-2">{t("error")}</h3>
          <p>{error}</p>
          <Button
            variant="outline"
            color="red"
            onClick={fetchEmployees}
            className="mt-4"
          >
            {t("tryAgain", { defaultValue: "Try Again" })}
          </Button>
        </div>
      )}

      {/* شريط البحث والفلترة */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          {/* حقل البحث */}
          <div className="relative flex-grow w-full sm:w-auto">
            <div
              className={`absolute inset-y-0 ${
                dir === "rtl" ? "right-0 pr-3" : "left-0 pl-3"
              } flex items-center pointer-events-none`}
            >
              <FaSearch className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              className={`${inputBaseClasses} ${inputDefaultClasses} ${
                dir === "rtl" ? "pr-10" : "pl-10"
              } w-full`}
              placeholder={t("employees.searchPlaceholder")}
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
          </div>

          {/* أزرار تبديل العرض */}
          <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md p-0.5 bg-slate-100 dark:bg-slate-700">
            <button
              onClick={() => setViewMode("list")}
              title={t("employees.viewAsList", { defaultValue: "List View" })}
              className={`p-1.5 rounded-md ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-600 text-sky-600 dark:text-sky-400 shadow"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600/50"
              }`}
            >
              <FaListUl size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title={t("employees.viewAsGrid", { defaultValue: "Grid View" })}
              className={`p-1.5 rounded-md ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-600 text-sky-600 dark:text-sky-400 shadow"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600/50"
              }`}
            >
              <FaThLarge size={16} />
            </button>
          </div>

          {/* زر الفلترة */}
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilter((prev) => !prev)}
            className="w-full sm:w-auto"
          >
            <FaFilter className={`${dir === "rtl" ? "ml-2" : "mr-2"}`} />
            {t("filter", { defaultValue: "Filter" })}
          </Button>

          {/* تحديد العناصر لكل صفحة */}
          <div className="w-full sm:w-auto">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className={`${inputBaseClasses} ${inputDefaultClasses} w-full`}
            >
              {[10, 25, 50, 100].map((val) => (
                <option key={val} value={val}>
                  {t("pagination.show", { count: val })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* الفلترة المتقدمة */}
        {showAdvancedFilter && (
          <AdvancedFilterForm
            activeFilters={activeFilters}
            onApplyFilters={(newFilters) => {
              setActiveFilters(newFilters);
              setCurrentPage(1);
            }}
            onClose={() => setShowAdvancedFilter(false)}
          />
        )}

        {/* الفلاتر السريعة */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("quickFilters", { defaultValue: "Quick Filters:" })}
          </span>
          {["ACTIVE", "ON_LEAVE", "TERMINATED"].map((statusValue) => (
            <button
              key={statusValue}
              onClick={() => {
                setActiveFilters((prev) => ({
                  ...prev,
                  status: prev.status === statusValue ? "" : statusValue,
                }));
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors
            ${
              activeFilters.status === statusValue
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
            }`}
            >
              {t(`enums.employeeStatus.${statusValue.toLowerCase()}`, {
                defaultValue: statusValue,
              })}
            </button>
          ))}
          {activeFilters.status && (
            <button
              onClick={() => {
                setActiveFilters((prev) => ({ ...prev, status: "" }));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 text-xs rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500"
              title={t("clearFilter", { defaultValue: "Clear status filter" })}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* عرض الموظفين */}
      {employees.length === 0 && !isLoading ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <FaUsers className="mx-auto text-6xl text-slate-400 dark:text-slate-500 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {t("employees.noEmployeesFound")}
          </p>
          {canManage && (
            <Button
              variant="primary"
              onClick={openModalForAdd}
              className="mt-6"
            >
              <FaPlus className={dir === "rtl" ? "ml-2" : "mr-2"} />
              {t("employees.addEmployeeButton")}
            </Button>
          )}
        </div>
      ) : viewMode === "list" ? (
        /* عرض القائمة */
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-xl rounded-lg border dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/60">
              <tr>
                <SortableHeader
                  columnKey="firstName"
                  labelKey="employees.table.name"
                />
                <SortableHeader
                  columnKey="employeeCode"
                  labelKey="employees.table.employeeId"
                />
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-left">
                  {t("employees.table.position")}
                </th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-left">
                  {t("employees.table.department")}
                </th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-left">
                  {t("employees.table.email")}
                </th>
                <SortableHeader
                  columnKey="status"
                  labelKey="employees.table.status"
                />
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50"
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                    {employee.firstName} {employee.lastName}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {employee.employeeCode}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {employee.position?.title || "N/A"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {employee.department?.name || "N/A"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {employee.user?.email || "N/A"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${
                    employee.isActive && employee.status === "ACTIVE"
                      ? "bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-600"
                      : "bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600"
                  }`}
                    >
                      {employee.isActive
                        ? t(
                            `enums.employeeStatus.${(
                              employee.status || "ACTIVE"
                            ).toLowerCase()}`,
                            {
                              defaultValue: employee.status || t("active"),
                            }
                          )
                        : t("inactive")}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center space-x-2 rtl:space-x-reverse">
                    <Link
                      to={`/employees/view/${employee.id}`}
                      className="p-1.5 inline-flex items-center justify-center text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 rounded-md hover:bg-sky-100 dark:hover:bg-sky-700/40"
                      title={t("viewDetails")}
                    >
                      <FaEye size={16} />
                    </Link>
                    {canManage && (
                      <>
                        <button
                          onClick={() => openModalForEdit(employee)}
                          className="p-1.5 inline-flex items-center justify-center text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 rounded-md hover:bg-amber-100 dark:hover:bg-amber-700/40"
                          title={t("edit")}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteEmployee(
                              employee.id,
                              `${employee.firstName} ${employee.lastName}`
                            )
                          }
                          className="p-1.5 inline-flex items-center justify-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-700/40"
                          title={t("delete")}
                        >
                          <FaTrashAlt size={15} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* عرض الشبكة */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={openModalForEdit}
              onDelete={handleDeleteEmployee}
              onView={handleViewEmployee}
            />
          ))}
        </div>
      )}

      {/* الترقيم */}
      {paginationInfo.totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
          <span className="text-sm text-slate-700 dark:text-slate-400 mb-2 sm:mb-0">
            {t("pagination.pageInfo", {
              current: paginationInfo.currentPage,
              total: paginationInfo.totalPages,
              records: paginationInfo.totalRecords,
            })}
          </span>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <PaginationButton
              onClick={() => goToPage(1)}
              disabled={!paginationInfo.hasPrevPage || isLoading}
              ariaLabel={t("pagination.firstPage")}
            >
              <FaAngleDoubleLeft
                className={dir === "rtl" ? "transform scale-x-[-1]" : ""}
              />
            </PaginationButton>
            <PaginationButton
              onClick={() => goToPage(paginationInfo.currentPage - 1)}
              disabled={!paginationInfo.hasPrevPage || isLoading}
              ariaLabel={t("pagination.previousPage")}
            >
              <FaAngleLeft
                className={dir === "rtl" ? "transform scale-x-[-1]" : ""}
              />
            </PaginationButton>

            <span className="px-2 py-1 text-sm text-slate-700 dark:text-slate-300">
              {paginationInfo.currentPage}
            </span>

            <PaginationButton
              onClick={() => goToPage(paginationInfo.currentPage + 1)}
              disabled={!paginationInfo.hasNextPage || isLoading}
              ariaLabel={t("pagination.nextPage")}
            >
              <FaAngleRight
                className={dir === "rtl" ? "transform scale-x-[-1]" : ""}
              />
            </PaginationButton>
            <PaginationButton
              onClick={() => goToPage(paginationInfo.totalPages)}
              disabled={!paginationInfo.hasNextPage || isLoading}
              ariaLabel={t("pagination.lastPage")}
            >
              <FaAngleDoubleRight
                className={dir === "rtl" ? "transform scale-x-[-1]" : ""}
              />
            </PaginationButton>
          </div>
        </div>
      )}

      {/* نافذة الإضافة/التعديل */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal} size="3xl">
          <EmployeeForm
            key={currentEmployee ? `edit-${currentEmployee.id}` : "add"}
            initialData={currentEmployee}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            isLoading={isSubmitting}
            formType={modalMode}
            serverValidationErrors={serverSideFormErrors}
          />
        </Modal>
      )}
    </div>
  );
};

export default EmployeeListPage;
