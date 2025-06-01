// src/features/employees/pages/EmployeeListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"; // سنستخدمها لزر "عرض التفاصيل" إذا كان يوجه لصفحة
import { useTranslation } from "react-i18next";
import axiosInstance from "../../../config/axiosInstance";
import { FaEdit, FaTrashAlt, FaEye, FaPlus, FaUsers } from "react-icons/fa";
import Modal from "../../../components/ui/Modal";
import EmployeeForm from "../components/EmployeeForm"; // افترض أن هذا المكون جاهز
import Button from "../../../components/ui/Button";
// import { useAuth } from '../../../contexts/AuthContext'; // يمكنك استخدامه للتحكم في الصلاحيات

const EmployeeListPage = () => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  // const { user } = useAuth(); // للحصول على أدوار المستخدم والتحكم في الصلاحيات

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // للتحميل العام للصفحة
  const [isSubmitting, setIsSubmitting] = useState(false); // للتحميل عند إرسال النموذج
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentEmployee, setCurrentEmployee] = useState(null); // الموظف الحالي للتعديل

  // --- دوال جلب البيانات ---
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/employees");
      if (response.data && response.data.success) {
        setEmployees(response.data.data);
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
  }, [t]); // الاعتماد على t إذا كانت رسائل الخطأ مترجمة

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]); // يُستدعى مرة واحدة عند تحميل المكون وعندما تتغير دالة fetchEmployees

  // --- دوال التعامل مع المودال ---
  const openModalForAdd = () => {
    setCurrentEmployee(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openModalForEdit = async (employeeSummary) => {
    // employeeSummary من الجدول
    setIsSubmitting(true); // استخدم isSubmitting أو isLoading عام
    setError(null);
    try {
      // جلب التفاصيل الكاملة للموظف
      const response = await axiosInstance.get(
        `/employees/${employeeSummary.id}`
      );
      if (response.data.success) {
        const fullEmployeeData = response.data.data;
        console.log("Full employee data for edit:", fullEmployeeData); // للتصحيح
        setCurrentEmployee(fullEmployeeData); // هذا يجب أن يحتوي على department.id, position.id, manager.id
        setModalMode("edit");
        setIsModalOpen(true);
      } else {
        setError(response.data.message || t("errors.failedToFetchDetails"));
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
  };

  // --- دوال التعامل مع عمليات CRUD ---
  const handleFormSubmit = async (formDataFromForm, employeeIdToUpdate) => {
    setIsSubmitting(true); // حالة تحميل خاصة بالنموذج
    setError(null); // أزل أي أخطاء عامة سابقة

    // تجهيز البيانات (قد تحتاج لتعديلها بناءً على ما يتوقعه الـ API)
    // إذا كان EmployeeForm يرسل كل شيء بما في ذلك حقول المستخدم، جيد.
    // إذا كان EmployeeForm يرسل فقط حقول Employee، ستحتاج لتضمين حقول User هنا إذا لزم الأمر.
    const payload = { ...formDataFromForm };

    // إزالة الحقول التي لا يجب إرسالها أو التي تكون فارغة (اختياري)
    // مثال: if (payload.password === '') delete payload.password;

    try {
      if (modalMode === "add") {
        await axiosInstance.post("/employees", payload);
        // يمكنك عرض رسالة نجاح باستخدام نظام إشعارات أفضل
        alert(t("employees.addSuccess"));
      } else if (modalMode === "edit" && employeeIdToUpdate) {
        await axiosInstance.put(`/employees/${employeeIdToUpdate}`, payload);
        alert(t("employees.updateSuccess"));
      }
      closeModal();
      fetchEmployees(); // أعد تحميل القائمة
    } catch (err) {
      console.error(
        `Failed to ${modalMode} employee:`,
        err.response?.data || err.message
      );
      const apiErrorMessage =
        err.response?.data?.message ||
        t(`employees.error${modalMode === "add" ? "Adding" : "Updating"}`);
      // لاحقًا: يمكنك تمرير أخطاء التحقق من الصحة (err.response?.data?.errors) إلى EmployeeForm
      // وعرضها بجانب كل حقل. الآن سنعرض رسالة عامة.
      alert(`${t("error")}: ${apiErrorMessage}`);
      // لا تغلق المودال عند الخطأ حتى يتمكن المستخدم من التصحيح
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (window.confirm(t("employees.confirmDelete", { name: employeeName }))) {
      setIsLoading(true); // يمكنك استخدام isSubmitting أيضًا أو حالة تحميل منفصلة
      try {
        await axiosInstance.delete(`/employees/${employeeId}`);
        alert(t("employees.deleteSuccess"));
        fetchEmployees(); // أعد تحميل القائمة
      } catch (err) {
        console.error("Failed to delete employee:", err);
        const errorMessage =
          err.response?.data?.message || t("employees.errorDeleting");
        alert(`${t("error")}: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- التحكم في العرض بناءً على الصلاحيات (مثال) ---
  // const canAdd = user && user.roles && (user.roles.includes('ADMIN') || user.roles.includes('HR_MANAGER'));
  // const canEdit = user && user.roles && (user.roles.includes('ADMIN') || user.roles.includes('HR_MANAGER'));
  // const canDelete = user && user.roles && (user.roles.includes('ADMIN') || user.roles.includes('HR_MANAGER'));
  // للتبسيط الآن، سنفترض أن المستخدم لديه كل الصلاحيات
  const canAdd = true;
  const canEdit = true;
  const canDelete = true;

  // --- عرض واجهة المستخدم ---
  if (isLoading && employees.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        {" "}
        {/* زدت الارتفاع */}
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

  if (error && !isLoading) {
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
          {t("tryAgain", { defaultValue: "Try Again" })}{" "}
          {/* أضف tryAgain للترجمة */}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          {t("employees.employeeListTitle")}
        </h1>
        {canAdd && (
          <Button
            variant="primary"
            onClick={openModalForAdd}
            className="shadow-md hover:shadow-lg"
          >
            <FaPlus className={`${dir === "rtl" ? "ml-2" : "mr-2"}`} />
            {t("employees.addEmployeeButton")}
          </Button>
        )}
      </div>

      {/* (لاحقًا) يمكنك إضافة حقل بحث وفلاتر هنا */}

      {employees.length === 0 && !isLoading ? (
        <div className="text-center py-16">
          <FaUsers className="mx-auto text-7xl text-slate-400 dark:text-slate-500 mb-6" />
          <p className="text-slate-600 dark:text-slate-400 text-xl">
            {t("employees.noEmployeesFound")}
          </p>
          {canAdd && (
            <Button
              variant="primary"
              onClick={openModalForAdd}
              className="mt-6"
            >
              <FaPlus className={`${dir === "rtl" ? "ml-2" : "mr-2"}`} />
              {t("employees.addEmployeeButton")}
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-xl rounded-lg border dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/60">
              <tr>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  {t("employees.table.name")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  {t("employees.table.employeeId")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  {t("employees.table.position")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  {t("employees.table.department")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  {t("employees.table.email")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  {t("employees.table.status")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-center" : "text-center"
                  }`}
                >
                  {" "}
                  {/* جعلته في الوسط */}
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors duration-150"
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
                    {employee.user?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        employee.isActive && employee.status === "ACTIVE"
                          ? "bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-600"
                          : "bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {/* استخدام مفتاح ترجمة مخصص للحالة إذا كان Status enum له قيم مختلفة */}
                      {employee.isActive
                        ? t(employee.status?.toLowerCase() || "active", {
                            defaultValue: employee.status || t("active"),
                          })
                        : t("inactive")}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 rtl:space-x-reverse text-center`}
                  >
                    {/* زر عرض التفاصيل (يمكن أن يفتح مودالاً آخر أو يوجه لصفحة) */}
                    <Link
                      to={`/employees/view/${employee.id}`} // لاحقًا، قد يكون هذا مودالاً أيضًا
                      className="p-1.5 inline-flex items-center justify-center text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 rounded-md hover:bg-sky-100 dark:hover:bg-sky-700/40 transition-colors"
                      title={t("viewDetails")}
                    >
                      <FaEye size={16} />
                    </Link>
                    {canEdit && (
                      <button
                        onClick={() => openModalForEdit(employee)}
                        className="p-1.5 inline-flex items-center justify-center text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 rounded-md hover:bg-amber-100 dark:hover:bg-amber-700/40 transition-colors"
                        title={t("edit")}
                      >
                        <FaEdit size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() =>
                          handleDeleteEmployee(
                            employee.id,
                            `${employee.firstName} ${employee.lastName}`
                          )
                        }
                        className="p-1.5 inline-flex items-center justify-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-700/40 transition-colors"
                        title={t("delete")}
                      >
                        <FaTrashAlt size={15} /> {/* حجم أصغر قليلاً للحذف */}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          size="3xl" // يمكنك تجربة أحجام مختلفة: sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
        >
          <EmployeeForm
            key={currentEmployee ? currentEmployee.id : "add"} // مفتاح لإعادة تعيين النموذج عند التبديل بين الإضافة والتعديل
            initialData={currentEmployee}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            isLoading={isSubmitting} // استخدام حالة التحميل الخاصة بالنموذج
            formType={modalMode}
          />
        </Modal>
      )}
    </div>
  );
};

export default EmployeeListPage;
