// src/features/employees/pages/EmployeeListPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../../config/axiosInstance"; // تأكد من أن هذا المسار صحيح
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
  FaChevronLeft, // استخدام أيقونات بديلة للأسهم
  FaChevronRight,
  FaListUl,
  FaThLarge,
  FaFilter,
  FaTimes,
  FaEllipsisH,
} from "react-icons/fa";
import Modal from "../../../components/ui/Modal"; // تأكد من أن هذا المسار صحيح
import EmployeeForm from "../components/EmployeeForm"; // تأكد من أن هذا المسار صحيح
import Button from "../../../components/ui/Button"; // تأكد من أن هذا المسار صحيح
import EmployeeCard from "../components/EmployeeCard"; // تأكد من أن هذا المسار صحيح
import PaginationButton from "../../../components/ui/PaginationButton"; // تأكد من أن هذا المسار صحيح
import AdvancedFilterForm from "../components/AdvancedFilterForm"; // تأكد من أن هذا المسار صحيح

// --- كلاسات CSS للمدخلات (افتراضية) ---
const inputBaseClasses =
  "w-96 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm";
const labelClasses =
  "block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
const inputDefaultClasses =
  "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-sky-500/50";
const EMPLOYEE_STATUSES_QUICK_FILTER = ["ACTIVE", "ON_LEAVE", "TERMINATED"];

const EmployeeListPage = () => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const [employees, setEmployees] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalRecords: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [activeFilters, setActiveFilters] = useState({});
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [serverSideFormErrors, setServerSideFormErrors] = useState({});

  // --- دالة جلب الموظفين (مع حساب الترقيم في الفرونت إند) ---
  const fetchEmployees = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: limit,
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: searchTerm.trim() || undefined,
        ...activeFilters,
      };

      Object.keys(params).forEach(
        (key) =>
          (params[key] === "" ||
            params[key] === null ||
            params[key] === undefined) &&
          delete params[key]
      );

      console.log("Fetching employees with params:", params);

      const response = await axiosInstance.get("/employees", { params });

      console.log("Full response data:", response.data);

      // قراءة بيانات الترقيم من المسار الصحيح للباك إند
      const paginationData = response.data?.meta?.pagination || response.data.pagination || {};
      const {
        totalRecords = 0,
        currentPage: page = 1,
        totalPages = 1,
      } = paginationData;

      setEmployees(response.data.data || []);
      setPaginationInfo({
        currentPage: page,
        totalPages: totalPages,
        totalRecords: totalRecords,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      });
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("employees.errorFetchingNetwork")
      );
      setEmployees([]);
      setPaginationInfo({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } finally {
      setIsFetching(false);
      console.log("Fetch finished. isFetching is now:", isFetching);
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
    setIsSubmitting(true);
    setError(null);
    try {
      if (!employeeSummary || !employeeSummary.id) {
        console.error("Invalid employee summary for edit.");
        setError(t("errors.invalidData"));
        setIsSubmitting(false);
        return;
      }
      const response = await axiosInstance.get(
        `/employees/${employeeSummary.id}`
      );
      if (response.data?.success && response.data.data) {
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
      let response;
      if (modalMode === "add") {
        response = await axiosInstance.post("/employees", formDataFromForm);
      } else if (modalMode === "edit" && employeeIdToUpdate) {
        response = await axiosInstance.put(
          `/employees/${employeeIdToUpdate}`,
          formDataFromForm
        );
      }

      if (response && response.data?.success) {
        alert(t(`employees.${modalMode}Success`));
        closeModal();
        fetchEmployees();
      } else {
        const apiErrorData = response?.data;
        if (apiErrorData?.errors && Array.isArray(apiErrorData.errors)) {
          const fieldErrors = {};
          apiErrorData.errors.forEach((fieldErr) => {
            const fieldName = fieldErr.path?.join(".");
            if (fieldName) fieldErrors[fieldName] = fieldErr.message;
          });
          setServerSideFormErrors(fieldErrors);
        } else if (apiErrorData?.message) {
          setError(apiErrorData.message);
        } else {
          setError(
            t(`employees.error${modalMode === "add" ? "Adding" : "Updating"}`)
          );
        }
      }
    } catch (err) {
      const apiErrorData = err.response?.data;
      if (apiErrorData?.errors && Array.isArray(apiErrorData.errors)) {
        const fieldErrors = {};
        apiErrorData.errors.forEach((fieldErr) => {
          const fieldName = fieldErr.path?.join(".");
          if (fieldName) fieldErrors[fieldName] = fieldErr.message;
        });
        setServerSideFormErrors(fieldErrors);
      } else if (apiErrorData?.message) {
        setError(apiErrorData.message);
      } else {
        setError(
          t(`employees.error${modalMode === "add" ? "Adding" : "Updating"}`)
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (window.confirm(t("employees.confirmDelete", { name: employeeName }))) {
      setIsSubmitting(true);
      setError(null);
      try {
        await axiosInstance.delete(`/employees/${employeeId}`);
        alert(t("employees.deleteSuccess"));
        if (
          employees.length === 1 &&
          currentPage > 1 &&
          paginationInfo.totalRecords > 0
        ) {
          goToPage(currentPage - 1);
        } else {
          fetchEmployees();
        }
      } catch (err) {
        const apiErrorData = err.response?.data;
        if (apiErrorData?.message) {
          alert(`${t("error")}: ${apiErrorData.message}`);
        } else {
          alert(`${t("error")}: ${t("employees.errorDeleting")}`);
        }
        setError(apiErrorData?.message || t("employees.errorDeleting"));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // --- دوال التحكم في القائمة ---
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
    setSearchTerm(e.target.value);
  };

  // Debounce لتأخير استدعاء البحث
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const goToPage = (pageNumber) => {
    if (
      pageNumber >= 1 &&
      pageNumber <= paginationInfo.totalPages &&
      pageNumber !== currentPage
    ) {
      console.log(`Attempting to go to page: ${pageNumber}`);
      setCurrentPage(pageNumber);
    }
  };

  // --- دالة لإنشاء أرقام الصفحات لعرضها ---
  const pageNumbersToDisplay = useMemo(() => {
    const total = paginationInfo.totalPages || 1;
    const current = currentPage || 1;

    if (total <= 1) return [1];

    const rangeWithDots = [];
    const delta = 1;
    const leftBound = current - delta;
    const rightBound = current + delta;

    rangeWithDots.push(1);
    if (leftBound > 2) rangeWithDots.push("...");
    for (
      let i = Math.max(2, leftBound);
      i <= Math.min(total - 1, rightBound);
      i++
    ) {
      rangeWithDots.push(i);
    }
    if (rightBound < total - 1) rangeWithDots.push("...");
    if (total > 1) rangeWithDots.push(total);

    return [...new Set(rangeWithDots)];
  }, [paginationInfo.totalPages, currentPage]);

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
    const iconMarginClass = dir === "rtl" ? "mr-1.5" : "ml-1.5";

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
          <span className={`inline-block ${iconMarginClass}`}>
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

  // --- دالة لتغيير الفلتر السريع ---
  const handleQuickFilterChange = (filterKey, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: value === prev[filterKey] ? "" : value,
    }));
    setCurrentPage(1);
  };

  // --- دالة لعرض تفاصيل الموظف ---
  const handleViewEmployee = (employee) => {
    console.log("Viewing employee:", employee);
    alert(
      `Viewing details for: ${employee.firstName} ${employee.lastName}. (Implement detail view)`
    );
  };

  // دالة لعرض مؤشر التحميل أو رسالة الخطأ
  const renderLoadingOrError = () => {
    if (isFetching && employees.length === 0) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
            <p
              className={`mt-4 text-lg ${
                dir === "rtl" ? "mr-4" : "ml-4"
              } text-slate-600 dark:text-slate-400`}
            >
              {t("loading")}
            </p>
          </div>
        </div>
      );
    }

    if (
      error &&
      !isFetching &&
      (!isModalOpen ||
        !serverSideFormErrors[Object.keys(serverSideFormErrors)[0]])
    ) {
      return (
        <div className="p-6 my-6 bg-red-100 dark:bg-red-900/40 border border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl shadow-md mx-auto max-w-4xl">
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
    return null;
  };

  // دالة لعرض محتوى القائمة (لا يوجد موظفين، أو عرض القائمة، أو عرض الشبكة)
  const renderContent = () => {
    if (employees.length === 0 && !isFetching && !error) {
      return (
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
              disabled={isSubmitting}
            >
              <FaPlus className={dir === "rtl" ? "ml-2" : "mr-2"} />
              {t("employees.addEmployeeButton")}
            </Button>
          )}
        </div>
      );
    }

    return (
      <>
        {viewMode === "list" ? (
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
              <tbody
                className={`bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700 ${
                  isFetching ? "opacity-50" : ""
                }`}
              >
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
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                              { defaultValue: employee.status || t("active") }
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
                          >
                            <FaTrashAlt size={15} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {isFetching && employees.length > 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-sky-500"></div>
                        <p className="ml-2 text-slate-500 dark:text-slate-400">
                          {t("loading")}...
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
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
            {isFetching && employees.length > 0 && (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-sky-500"></div>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  // --- بداية Return الرئيسي للمحتوى ---
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          {t("employees.employeeListTitle")}
        </h1>
        {canManage && (
          <Button
            variant="primary"
            onClick={openModalForAdd}
            className="shadow-md hover:shadow-lg whitespace-nowrap"
            disabled={isSubmitting}
          >
            <FaPlus className={`${dir === "rtl" ? "ml-2" : "mr-2"}`} />
            {t("employees.addEmployee")}
          </Button>
        )}
      </div>

      {error && !isSubmitting && !showAdvancedFilter && !isFetching && (
        <div className="p-4 mb-6 bg-red-100 dark:bg-red-900/40 border border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl shadow-md">
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
      )}

      <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
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
              disabled={isFetching}
            />
          </div>
          <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md p-0.5 bg-slate-100 dark:bg-slate-700">
            <button
              onClick={() => setViewMode("list")}
              title={t("employees.viewAsList", { defaultValue: "List View" })}
              className={`p-1.5 rounded-md ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-600 text-sky-600 dark:text-sky-400 shadow"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600/50"
              }`}
              disabled={isFetching}
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
              disabled={isFetching}
            >
              <FaThLarge size={16} />
            </button>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilter((prev) => !prev)}
            className="w-full sm:w-auto"
            disabled={isFetching}
          >
            <FaFilter className={`${dir === "rtl" ? "ml-2" : "mr-2"}`} />
            {t("filter", { defaultValue: "Filter" })}
          </Button>
          <div className="w-full sm:w-auto">
            <label htmlFor="limitPerPage" className={labelClasses}>
              {t("pagination.itemsPerPage")}
            </label>
            <select
              id="limitPerPage"
              name="limitPerPage"
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className={`${inputBaseClasses} ${inputDefaultClasses} w-full`}
              disabled={isFetching}
            >
              {[5, 10, 25, 50, 100].map((val) => (
                <option key={val} value={val}>
                  {t("pagination.show", { count: val })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showAdvancedFilter && (
          <AdvancedFilterForm
            activeFilters={activeFilters}
            onApplyFilters={(newFilters) => {
              setActiveFilters(newFilters);
              setCurrentPage(1);
              setShowAdvancedFilter(false);
            }}
            onClose={() => setShowAdvancedFilter(false)}
          />
        )}

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("quickFilters", { defaultValue: "Quick Filters:" })}
          </span>
          {EMPLOYEE_STATUSES_QUICK_FILTER.map((statusValue) => (
            <button
              key={statusValue}
              onClick={() => handleQuickFilterChange("status", statusValue)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                activeFilters.status === statusValue
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              }`}
              disabled={isFetching}
            >
              {t(`enums.employeeStatus.${statusValue.toLowerCase()}`, {
                defaultValue: statusValue,
              })}
            </button>
          ))}
          {activeFilters.status && (
            <button
              onClick={() => {
                handleQuickFilterChange("status", activeFilters.status);
              }}
              className="px-2.5 py-1 text-xs rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500"
              title={t("clearFilter", { defaultValue: "Clear status filter" })}
              disabled={isFetching}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {renderLoadingOrError()}

      {!isFetching && !error && (
        <>
          {renderContent()}
          {(paginationInfo.totalPages > 1 || employees.length > 0) &&
            !error &&
            !isFetching && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-sm text-slate-700 dark:text-slate-400 mb-2 sm:mb-0 order-2 sm:order-1">
                  {t("pagination.pageInfo", {
                    current: paginationInfo.currentPage,
                    total: paginationInfo.totalPages,
                    records: paginationInfo.totalRecords,
                  })}
                </span>
                <div className="flex items-center space-x-1 rtl:space-x-reverse order-1 sm:order-2">
                  <PaginationButton
                    onClick={() => goToPage(1)}
                    disabled={paginationInfo.currentPage <= 1 || isFetching}
                    ariaLabel={t("pagination.firstPage")}
                  >
                    {/* استخدام أيقونة بديلة */}
                    <FaChevronLeft
                      className={dir === "rtl" ? "transform scale-x-[-1]" : ""}
                    />
                  </PaginationButton>

                  <PaginationButton
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={paginationInfo.currentPage <= 1 || isFetching}
                    ariaLabel={t("pagination.previousPage")}
                  >
                    <FaChevronLeft
                      className={dir === "rtl" ? "transform scale-x-[-1]" : ""}
                    />
                  </PaginationButton>

                  {pageNumbersToDisplay.map((page, index) =>
                    page === "..." ? (
                      <span
                        key={`dots-${index}`}
                        className="px-2 py-1 text-sm text-slate-500 dark:text-slate-400 flex items-center"
                      >
                        <FaEllipsisH />
                      </span>
                    ) : (
                      <PaginationButton
                        key={page}
                        onClick={() => goToPage(page)}
                        disabled={isFetching}
                        isActive={currentPage === page}
                        ariaLabel={`${t("pagination.goToPage")} ${page}`}
                      >
                        {page}
                      </PaginationButton>
                    )
                  )}

                  <PaginationButton
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={
                      paginationInfo.currentPage >= paginationInfo.totalPages ||
                      isFetching
                    }
                    ariaLabel={t("pagination.nextPage")}
                  >
                    <FaChevronRight
                      className={dir === "rtl" ? "transform scale-x-[-1]" : ""}
                    />
                  </PaginationButton>

                  <PaginationButton
                    onClick={() => goToPage(paginationInfo.totalPages)}
                    disabled={
                      paginationInfo.currentPage >= paginationInfo.totalPages ||
                      isFetching
                    }
                    ariaLabel={t("pagination.lastPage")}
                  >
                    <FaChevronRight
                      className={dir === "rtl" ? "transform scale-x-[-1]" : ""}
                    />
                  </PaginationButton>
                </div>
              </div>
            )}
        </>
      )}

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
