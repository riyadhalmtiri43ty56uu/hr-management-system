// src/features/departments/pages/PositionsListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../../config/axiosInstance";
import { FaEdit, FaTrashAlt, FaPlus, FaBriefcase } from "react-icons/fa";
import Modal from "../../../components/ui/Modal";
import PositionForm from "../components/PositionForm"; // تأكد من المسار الصحيح
import Button from "../../../components/ui/Button";

const PositionsListPage = () => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentPosition, setCurrentPosition] = useState(null);

  const fetchPositions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // نفترض أن هذا المسار يجلب كل الوظائف مع معلومات القسم المرتبط
      const response = await axiosInstance.get("/positions");
      if (response.data && response.data.success) {
        setPositions(response.data.data);
      } else {
        setError(response.data.message || t("positions.errorFetching"));
      }
    } catch (err) {
      console.error("Failed to fetch positions:", err);
      setError(
        err.response?.data?.message || t("positions.errorFetchingNetwork")
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const openModalForAdd = () => {
    setCurrentPosition(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openModalForEdit = (position) => {
    setCurrentPosition(position);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPosition(null);
  };

  const handleFormSubmit = async (formData, positionIdToUpdate) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (modalMode === "add") {
        await axiosInstance.post("/positions", formData);
        alert(t("positions.addSuccess"));
      } else if (modalMode === "edit" && positionIdToUpdate) {
        await axiosInstance.put(`/positions/${positionIdToUpdate}`, formData);
        alert(t("positions.updateSuccess"));
      }
      closeModal();
      fetchPositions();
    } catch (err) {
      console.error(
        `Failed to ${modalMode} position:`,
        err.response?.data || err.message
      );
      const apiErrorMessage =
        err.response?.data?.message ||
        t(`positions.error${modalMode === "add" ? "Adding" : "Updating"}`);
      alert(`${t("error")}: ${apiErrorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePosition = async (positionId, positionTitle) => {
    if (
      window.confirm(t("positions.confirmDelete", { title: positionTitle }))
    ) {
      setIsLoading(true);
      try {
        await axiosInstance.delete(`/positions/${positionId}`);
        alert(t("positions.deleteSuccess"));
        fetchPositions();
      } catch (err) {
        console.error("Failed to delete position:", err);
        const errorMessage =
          err.response?.data?.message || t("positions.errorDeleting");
        alert(`${t("error")}: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const canManagePositions = true; // استبدل بمنطق الصلاحيات

  if (isLoading && positions.length === 0) {
    /* ... عرض التحميل ... */
  }
  if (error && !isLoading) {
    /* ... عرض الخطأ ... */
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          {t("positions.positionListTitle")}
        </h1>
        {canManagePositions && (
          <Button
            variant="primary"
            onClick={openModalForAdd}
            className="shadow-md hover:shadow-lg"
          >
            <FaPlus className={`${dir === "rtl" ? "ml-2" : "mr-2"}`} />
            {t("positions.addPositionButton")}
          </Button>
        )}
      </div>

      {positions.length === 0 && !isLoading ? (
        <div className="text-center py-16">
          <FaBriefcase className="mx-auto text-7xl text-slate-400 dark:text-slate-500 mb-6" />
          <p className="text-slate-600 dark:text-slate-400 text-xl">
            {t("positions.noPositionsFound")}
          </p>
          {canManagePositions && (
            <Button
              variant="primary"
              onClick={openModalForAdd}
              className="mt-6"
            >
              <FaPlus className={`${dir === "rtl" ? "ml-2" : "mr-2"}`} />
              {t("positions.addPositionButton")}
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
                  {t("positions.table.title")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  {t("positions.table.code")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  {t("departments.table.name")}
                </th>{" "}
                {/* اسم القسم */}
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center`}
                >
                  {t("employees.table.status")}
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center`}
                >
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {positions.map((pos) => (
                <tr
                  key={pos.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                    {pos.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {pos.code || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {pos.department?.name || "N/A"}
                  </td>{" "}
                  {/* افترض أن API ترجع كائن department متداخل */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pos.isActive
                          ? "bg-green-100 ... text-green-700 ..."
                          : "bg-red-100 ... text-red-700 ..."
                      }`}
                    >
                      {pos.isActive ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 rtl:space-x-reverse text-center`}
                  >
                    {canManagePositions && (
                      <>
                        <button
                          onClick={() => openModalForEdit(pos)}
                          className="p-1.5 ... text-amber-600 ..."
                          title={t("edit")}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeletePosition(pos.id, pos.title)
                          }
                          className="p-1.5 ... text-red-600 ..."
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
        <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
          <PositionForm
            key={currentPosition ? currentPosition.id : "add-pos"}
            initialData={currentPosition}
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

export default PositionsListPage;
