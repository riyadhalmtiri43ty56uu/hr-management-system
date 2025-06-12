// src/features/departments/pages/DepartmentsListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"; // إذا كنت ستربط بتفاصيل القسم
import { useTranslation } from "react-i18next";
import axiosInstance from "../../../config/axiosInstance";
import { FaEdit, FaTrashAlt, FaPlus, FaSitemap } from "react-icons/fa";
import Modal from "../../../components/ui/Modal";
import DepartmentForm from "../components/DepartmentForm";
import Button from "../../../components/ui/Button";

const DepartmentsListPage = () => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentDepartment, setCurrentDepartment] = useState(null);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/departments"); // نفترض أن هذا المسار يجلب كل الأقسام مع تفاصيل
      if (response.data && response.data.success) {
        setDepartments(response.data.data);
      } else {
        setError(
          response.data.message ||
            t("departments.errorFetching", {
              defaultValue: "Error fetching departments.",
            })
        );
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setError(
        err.response?.data?.message ||
          t("departments.errorFetchingNetwork", {
            defaultValue: "Network error while fetching departments.",
          })
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const openModalForAdd = () => {
    setCurrentDepartment(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openModalForEdit = (department) => {
    setCurrentDepartment(department);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDepartment(null);
  };

  const handleFormSubmit = async (formData, departmentIdToUpdate) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (modalMode === "add") {
        await axiosInstance.post("/departments", formData);
        alert(t("departments.addSuccess"));
      } else if (modalMode === "edit" && departmentIdToUpdate) {
        await axiosInstance.put(
          `/departments/${departmentIdToUpdate}`,
          formData
        );
        alert(t("departments.updateSuccess"));
      }
      closeModal();
      fetchDepartments();
    } catch (err) {
      console.error(
        `Failed to ${modalMode} department:`,
        err.response?.data || err.message
      );
      const apiErrorMessage =
        err.response?.data?.message ||
        t(`departments.error${modalMode === "add" ? "Adding" : "Updating"}`);
      alert(`${t("error")}: ${apiErrorMessage}`);
      // لا تغلق المودال عند الخطأ
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (departmentId, departmentName) => {
    if (
      window.confirm(t("departments.confirmDelete", { name: departmentName }))
    ) {
      setIsLoading(true);
      try {
        await axiosInstance.delete(`/departments/${departmentId}`);
        alert(t("departments.deleteSuccess"));
        fetchDepartments();
      } catch (err) {
        console.error("Failed to delete department:", err);
        const errorMessage =
          err.response?.data?.message || t("departments.errorDeleting");
        alert(`${t("error")}: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // (اختياري) التحكم في العرض بناءً على الصلاحيات
  const canManageDepartments = true; // استبدل هذا بمنطق الصلاحيات الفعلي

  if (isLoading && departments.length === 0) {
    /* ... (عرض التحميل) ... */
  }
  if (error && !isLoading) {
    /* ... (عرض الخطأ) ... */
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          {t("departments.departmentListTitle")}
        </h1>
        {canManageDepartments && (
          <Button
            variant="primary"
            onClick={openModalForAdd}
            className="shadow-md hover:shadow-lg"
          >
            <FaPlus className={`${dir === "rtl" ? "ml-2" : "mr-2"}`} />
            {t("departments.addDepartmentButton")}
          </Button>
        )}
      </div>

      {departments.length === 0 && !isLoading ? (
        <div className="text-center py-16">
          <FaSitemap className="mx-auto text-7xl text-slate-400 dark:text-slate-500 mb-6" />
          <p className="text-slate-600 dark:text-slate-400 text-xl">
            {t("departments.noDepartmentsFound")}
          </p>
          {canManageDepartments && (
            <Button
              variant="primary"
              onClick={openModalForAdd}
              className="mt-6"
            >
              <FaPlus className={`${dir === "rtl" ? "ml-2" : "mr-2"}`} />
              {t("departments.addDepartmentButton")}
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
                  {t("departments.table.name")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  {t("departments.table.code")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  {t("departments.table.parentDepartment")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-center" : "text-center"
                  }`}
                >
                  {t("departments.table.employeesCount")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-center" : "text-center"
                  }`}
                >
                  {t("departments.table.positionsCount")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-center" : "text-center"
                  }`}
                >
                  {t("employees.table.status")} {/* استخدام مفتاح موجود */}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-center" : "text-center"
                  }`}
                >
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {departments.map((dept) => (
                <tr
                  key={dept.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {dept.code || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {dept.parentDepartment?.name ||
                      t("departments.form.selectParentOptional")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 text-center">
                    {dept._count?.employees || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 text-center">
                    {dept._count?.positions || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        dept.isActive
                          ? "bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-600"
                          : "bg-red-100 dark:bg-red-700/40 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-600"
                      }`}
                    >
                      {dept.isActive ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 rtl:space-x-reverse text-center`}
                  >
                    {canManageDepartments && (
                      <>
                        <button
                          onClick={() => openModalForEdit(dept)}
                          className="p-1.5 inline-flex items-center justify-center text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 rounded-md hover:bg-amber-100 dark:hover:bg-amber-700/40 transition-colors"
                          title={t("edit")}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteDepartment(dept.id, dept.name)
                          }
                          className="p-1.5 inline-flex items-center justify-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-700/40 transition-colors"
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
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          // title prop يمكن تركه فارغًا إذا كان النموذج يعرض عنوانه الخاص
          size="xl" // أو الحجم المناسب لنموذج القسم
        >
          <DepartmentForm
            key={currentDepartment ? currentDepartment.id : "add-dept"}
            initialData={currentDepartment}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            isLoading={isSubmitting}
            formType={modalMode}
            serverValidationErrors={
              error && error.errors
                ? error.errors.reduce(
                    (acc, cur) => ({
                      ...acc,
                      [cur.path.split(".").pop()]: cur.message,
                    }),
                    {}
                  )
                : {}
            }
          />
        </Modal>
      )}
    </div>
  );
};

export default DepartmentsListPage;
