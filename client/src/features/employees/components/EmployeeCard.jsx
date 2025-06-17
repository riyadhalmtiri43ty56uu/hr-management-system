// src/features/employees/components/EmployeeCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaBuilding,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaEllipsisV,
} from "react-icons/fa";
// افترض أن لديك مكون Dropdown بسيط أو ستستخدم منطقًا لإظهار/إخفاء قائمة الإجراءات
// import DropdownMenu from '../../../components/ui/DropdownMenu'; // مثال

const EmployeeCard = ({ employee, onEdit, onDelete, onView }) => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const [isActionsOpen, setIsActionsOpen] = React.useState(false); // لحالة قائمة الإجراءات

  if (!employee) return null;

  const placeholderAvatar =
    "https://via.placeholder.com/100/cbd5e1/475569?text=" +
    (employee.firstName?.[0] || "") +
    (employee.lastName?.[0] || "");

  const statusColor =
    employee.isActive && employee.status === "ACTIVE"
      ? "bg-green-500"
      : "bg-slate-400 dark:bg-slate-600";

  const statusText = employee.isActive
    ? t((employee.status || "active").toLowerCase(), {
        defaultValue: employee.status || t("active"),
      })
    : t("inactive");

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl rounded-xl overflow-hidden transition-all duration-300 border dark:border-slate-700 flex flex-col">
      {/* رأس البطاقة مع صورة وحالة واسم */}
      <div className="p-5 border-b dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="relative">
            <img
              src={employee.profilePictureUrl || placeholderAvatar}
              alt={`${employee.firstName} ${employee.lastName}`}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-offset-2 dark:ring-offset-slate-800 ring-sky-500"
            />
            {/* نقطة الحالة */}
            <span
              className={`absolute bottom-0 ${
                dir === "rtl" ? "left-0" : "right-0"
              } w-4 h-4 ${statusColor} rounded-full border-2 border-white dark:border-slate-800`}
              title={statusText}
            ></span>
          </div>
          {/* زر الإجراءات (الثلاث نقاط) */}
          <div className="relative">
            <button
              onClick={() => setIsActionsOpen((prev) => !prev)}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none"
              aria-label={t("actions")}
            >
              <FaEllipsisV />
            </button>
            {/* قائمة الإجراءات المنسدلة */}
            {isActionsOpen && (
              <div
                className={`absolute ${
                  dir === "rtl" ? "left-0" : "right-0"
                } mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg z-10 border dark:border-slate-600`}
                onMouseLeave={() => setIsActionsOpen(false)} // إغلاق عند ابتعاد الماوس (بسيط)
              >
                <ul className="py-1">
                  <li>
                    <button
                      onClick={() => {
                        onView(employee);
                        setIsActionsOpen(false);
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                    >
                      <FaEye
                        className={`${
                          dir === "rtl" ? "ml-2" : "mr-2"
                        } text-sky-500`}
                      />{" "}
                      {t("viewDetails")}
                    </button>
                  </li>
                  {/* افترض canEdit */}
                  {true && (
                    <li>
                      <button
                        onClick={() => {
                          onEdit(employee);
                          setIsActionsOpen(false);
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                      >
                        <FaEdit
                          className={`${
                            dir === "rtl" ? "ml-2" : "mr-2"
                          } text-amber-500`}
                        />{" "}
                        {t("edit")}
                      </button>
                    </li>
                  )}
                  {/* افترض canDelete */}
                  {true && (
                    <li>
                      <button
                        onClick={() => {
                          onDelete(
                            employee.id,
                            `${employee.firstName} ${employee.lastName}`
                          );
                          setIsActionsOpen(false);
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-600/50"
                      >
                        <FaTrashAlt
                          className={`${dir === "rtl" ? "ml-2" : "mr-2"}`}
                        />{" "}
                        {t("delete")}
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        <h3
          className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate"
          title={`${employee.firstName} ${employee.lastName}`}
        >
          {employee.firstName} {employee.lastName}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {employee.employeeCode}
        </p>
      </div>

      {/* جسم البطاقة مع التفاصيل */}
      <div className="p-5 space-y-2 text-sm flex-grow">
        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <FaEnvelope
            size={14}
            className={`${
              dir === "rtl" ? "ml-2" : "mr-2"
            } text-slate-400 dark:text-slate-500`}
          />
          <span className="truncate">{employee.user?.email || "N/A"}</span>
        </div>
        {employee.phoneNumber && (
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <FaPhone
              size={14}
              className={`${
                dir === "rtl" ? "ml-2" : "mr-2"
              } text-slate-400 dark:text-slate-500`}
            />
            <span>{employee.phoneNumber}</span>
          </div>
        )}
        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <FaBriefcase
            size={14}
            className={`${
              dir === "rtl" ? "ml-2" : "mr-2"
            } text-slate-400 dark:text-slate-500`}
          />
          <span className="truncate">{employee.position?.title || "N/A"}</span>
        </div>
        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <FaBuilding
            size={14}
            className={`${
              dir === "rtl" ? "ml-2" : "mr-2"
            } text-slate-400 dark:text-slate-500`}
          />
          <span className="truncate">{employee.department?.name || "N/A"}</span>
        </div>
      </div>

      {/* (اختياري) تذييل البطاقة */}
      {/* <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700">
        <Link to={`/employees/view/${employee.id}`} className="text-sm text-sky-600 dark:text-sky-400 hover:underline">
          {t('viewFullProfile', {defaultValue: 'View Full Profile'})}
        </Link>
      </div> */}
    </div>
  );
};

export default EmployeeCard;
