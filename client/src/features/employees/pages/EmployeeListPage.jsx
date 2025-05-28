// src/features/employees/pages/EmployeeListPage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../../config/axiosInstance"; // لاستدعاء API
// import { useAuth } from '../../../contexts/AuthContext'; // يمكنك استخدامه للتحقق من الصلاحيات هنا أيضًا إذا أردت

const EmployeeListPage = () => {
  const { t } = useTranslation();
  // const { user } = useAuth(); // للحصول على معلومات المستخدم إذا احتجت

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // استدعاء API لجلب قائمة الموظفين
        const response = await axiosInstance.get("/employees");
        // افترض أن الرد يحتوي على { data: employeesArray, message: "...", success: true }
        // بناءً على ApiResponse.js الذي أنشأناه
        if (response.data && response.data.success) {
          setEmployees(response.data.data);
        } else {
          // إذا لم يكن الرد بالشكل المتوقع أو success=false
          setError(response.data.message || t("employees.errorFetching"));
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(t("employees.errorFetchingNetwork"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [t]); // أضفت t إلى الاعتماديات إذا كانت رسائل الخطأ مترجمة

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        <p className="ml-3 text-slate-600 dark:text-slate-400">
          {t("loading") || "Loading employees..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md">
        {t("error")}: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">
        {t("employees.employeeListTitle") || "Employee List"}
      </h1>

      {employees.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">
          {t("employees.noEmployeesFound") || "No employees found."}
        </p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                >
                  {t("employees.table.name") || "Name"}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                >
                  {t("employees.table.employeeId") || "Employee ID"}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                >
                  {t("employees.table.position") || "Position"}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                >
                  {t("employees.table.department") || "Department"}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                >
                  {t("employees.table.email") || "Email"}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                >
                  {t("employees.table.status") || "Status"}
                </th>
                {/* أضف أعمدة أخرى حسب الحاجة */}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                    {employee.firstName} {employee.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {employee.employeeCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {employee.position?.title || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {employee.department?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {/* البريد الإلكتروني يأتي من علاقة User */}
                    {employee.email?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.isActive
                          ? "bg-green-100 dark:bg-green-700/30 text-green-800 dark:text-green-200"
                          : "bg-red-100 dark:bg-red-700/30 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {employee.isActive ? t("active") : t("inactive")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeListPage;
