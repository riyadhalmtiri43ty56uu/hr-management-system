// src/layouts/Navbar.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom"; // <-- استيراد Link و NavLink
import { useTranslation } from "react-i18next"; // <-- استيراد useTranslation
import {
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaMoon,
  FaBell,
  FaCog,
  FaUserCircle,
  FaLock,
  FaSignOutAlt,
  FaGlobe,
  FaAngleDown,
  FaPlus,
} from "react-icons/fa";

// بيانات وهمية للإشعارات (استبدلها ببيانات حقيقية من API)
const mockNotifications = [
  {
    id: 1,
    titleKey: "notification_update_title",
    messageKey: "notification_update_message",
    created_at: "2024-05-20 10:00",
    data: { version: "1.2" },
  },
  {
    id: 2,
    titleKey: "notification_leave_request_title",
    messageKey: "notification_leave_request_message",
    created_at: "2024-05-20 09:30",
    data: { employeeName: "أحمد" },
  },
];
// أضف المفاتيح أعلاه إلى ملفات الترجمة. مثال:
// "notification_update_title": "New Update Available"
// "notification_update_message": "Version {{version}} of the system has been released."

const Navbar = ({
  onToggleMobileSidebar,
  onToggleMainSidebar,
  isMainSidebarOpen,
  // isDarkMode, // سيتم الحصول عليه من useTranslation أو context/hook مخصص
  // toggleDarkMode, // نفس الشيء
  // currentLanguage, // سيتم الحصول عليه من i18n
  // switchLanguage, // نفس الشيء
  user,
  onLogout,
  breadcrumbKey, // مفتاح الترجمة للمسار الحالي
}) => {
  const { t, i18n } = useTranslation(); // Hook الترجمة
  const currentLanguage = i18n.language; // الحصول على اللغة الحالية من i18n
  const dir = i18n.dir(); // الحصول على اتجاه النص من i18n

  // الحالة للوضع الداكن (يمكن نقلها إلى Context/App.jsx إذا كانت تستخدم في أماكن أخرى بكثرة)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode
      ? JSON.parse(savedMode)
      : window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkModeHandler = () => setIsDarkMode((prev) => !prev); // دالة محلية لتبديل الوضع الداكن
  const switchLanguageHandler = (lang) => i18n.changeLanguage(lang); // دالة محلية لتبديل اللغة

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const notificationsRef = useRef(null);
  const settingsRef = useRef(null);
  const languageRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      )
        setIsNotificationsOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(event.target))
        setIsSettingsOpen(false);
      if (languageRef.current && !languageRef.current.contains(event.target))
        setIsLanguageDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNotifications = (e) => {
    e.stopPropagation();
    setIsNotificationsOpen((p) => !p);
    setIsSettingsOpen(false);
    setIsLanguageDropdownOpen(false);
  };
  const handleToggleSettings = (e) => {
    e.stopPropagation();
    setIsSettingsOpen((p) => !p);
    setIsNotificationsOpen(false);
    setIsLanguageDropdownOpen(false);
  };
  const handleToggleLanguageDropdown = (e) => {
    e.stopPropagation();
    setIsLanguageDropdownOpen((p) => !p);
    setIsNotificationsOpen(false);
    setIsSettingsOpen(false);
  };

  const currentBreadcrumbText = t(breadcrumbKey || "navbar.dashboard");

  return (
    <nav
      className="bg-white dark:bg-slate-800/80 backdrop-blur-sm shadow-sm
                 sticky top-0 z-30 h-16
                 flex items-center justify-between px-4 sm:px-6
                 transition-colors duration-300 ease-in-out"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMainSidebar}
          className="text-slate-500 dark:text-slate-400 focus:outline-none hidden lg:block p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
          title={
            isMainSidebarOpen
              ? t("navbar.collapseSidebar")
              : t("navbar.expandSidebar")
          }
        >
          {isMainSidebarOpen ? (
            dir === "rtl" ? (
              <FaChevronRight size={18} />
            ) : (
              <FaChevronLeft size={18} />
            )
          ) : dir === "rtl" ? (
            <FaChevronLeft size={18} />
          ) : (
            <FaChevronRight size={18} />
          )}
        </button>

        <button
          onClick={onToggleMobileSidebar}
          className="text-slate-500 dark:text-slate-400 focus:outline-none lg:hidden p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
          aria-label={t("navbar.openMenu")}
        >
          <FaBars size={20} />
        </button>

        <div className="hidden sm:flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
          <span>{currentBreadcrumbText}</span>
        </div>
      </div>

      <div
        className={`flex items-center space-x-2 sm:space-x-3 ${
          dir === "rtl" ? "space-x-reverse sm:space-x-reverse" : ""
        }`}
      >
        <button
          onClick={toggleDarkModeHandler}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 focus:outline-none"
          title={isDarkMode ? t("navbar.lightMode") : t("navbar.darkMode")}
        >
          {isDarkMode ? (
            <FaSun size={18} className="text-yellow-400" />
          ) : (
            <FaMoon size={18} className="text-sky-500" />
          )}
        </button>

        <div className="relative" ref={notificationsRef}>
          <button
            onClick={handleToggleNotifications}
            className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 focus:outline-none"
            aria-label={t("navbar.notifications")}
          >
            <FaBell size={18} />
            {mockNotifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-semibold animate-pulse">
                {mockNotifications.length}
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div
              className={`absolute mt-2 w-72 sm:w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 border dark:border-slate-200 dark:border-slate-700 ${
                dir === "rtl" ? "left-0" : "right-0"
              }`}
            >
              <div className="p-3 font-semibold border-b dark:border-slate-700 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-slate-100">
                {t("navbar.notifications")}
              </div>
              {mockNotifications.length > 0 ? (
                mockNotifications.map((notification) => (
                  <Link // <-- استخدام Link هنا إذا كان الإشعار يقود إلى صفحة معينة
                    to={`/notifications/${notification.id}`} // مثال لمسار الإشعار
                    key={notification.id}
                    className="block p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b dark:border-slate-700/50 last:border-b-0"
                    onClick={() => setIsNotificationsOpen(false)} // إغلاق القائمة عند النقر
                  >
                    <div className="font-medium text-sm text-slate-700 dark:text-slate-200">
                      {t(notification.titleKey, notification.data)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t(notification.messageKey, notification.data)}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {notification.created_at}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t("navbar.noNewNotifications")}
                </div>
              )}
              <div className="p-2 text-center border-t dark:border-slate-700 sticky bottom-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <Link
                  to="/notifications"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
                >
                  {t("navbar.viewAllNotifications")}
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={settingsRef}>
          <button
            onClick={handleToggleSettings}
            className="w-9 h-9 rounded-full overflow-hidden focus:outline-none ring-2 ring-transparent hover:ring-sky-500 dark:hover:ring-sky-400 focus:ring-sky-500 dark:focus:ring-sky-400 transition"
            aria-label={t("navbar.settings")}
          >
            {user && user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.name || t("navbar.user_avatar_alt")}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-white">
                <FaUserCircle size={24} className="opacity-80" />
              </div>
            )}
          </button>
          {isSettingsOpen && (
            <div
              className={`absolute mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 border dark:border-slate-200 dark:border-slate-700 overflow-hidden ${
                dir === "rtl" ? "left-0" : "right-0"
              }`}
            >
              <div className="px-4 py-3 border-b dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {user?.name || t("navbar.guest")} {/* ✅  يستخدم user.name */}
                </p>
              </div>
              <NavLink // <-- استخدام NavLink هنا
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700/50 ${
                    isActive
                      ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-700/30"
                      : "text-slate-700 dark:text-slate-300"
                  }`
                }
                onClick={() => setIsSettingsOpen(false)}
              >
                <FaUserCircle className="text-slate-500 dark:text-slate-400" />
                <span>{t("navbar.profile")}</span>
              </NavLink>
              <NavLink // <-- استخدام NavLink هنا
                to="/settings/change-password" // مثال لمسار
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700/50 ${
                    isActive
                      ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-700/30"
                      : "text-slate-700 dark:text-slate-300"
                  }`
                }
                onClick={() => setIsSettingsOpen(false)}
              >
                <FaLock className="text-slate-500 dark:text-slate-400" />
                <span>{t("navbar.changePassword")}</span>
              </NavLink>
              <button
                onClick={() => {
                  onLogout();
                  setIsSettingsOpen(false);
                }}
                className="flex items-center w-full text-left gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/30"
              >
                <FaSignOutAlt />
                <span>{t("navbar.logout")}</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative hidden sm:block" ref={languageRef}>
          <button
            onClick={handleToggleLanguageDropdown}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center focus:outline-none"
            aria-label={t("navbar.changeLanguage")}
          >
            <FaGlobe size={18} />
            <FaAngleDown
              size={12}
              className={`${dir === "rtl" ? "mr-1" : "ml-1"}`}
            />
          </button>
          {isLanguageDropdownOpen && (
            <div
              className={`absolute mt-2 w-36 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-200 dark:border-slate-700 z-50 overflow-hidden ${
                dir === "rtl" ? "left-0" : "right-0"
              }`}
            >
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => {
                      switchLanguageHandler("ar");
                      setIsLanguageDropdownOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-sm ${
                      dir === "rtl" ? "text-right" : "text-left"
                    } ${
                      currentLanguage === "ar"
                        ? "font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-700/30"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {t("navbar.arabic")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      switchLanguageHandler("en");
                      setIsLanguageDropdownOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-sm ${
                      dir === "rtl" ? "text-right" : "text-left"
                    } ${
                      currentLanguage === "en"
                        ? "font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-700/30"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {t("navbar.english")}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {user?.roles?.includes("admin") && (
          <Link // <-- استخدام Link هنا
            to="/admin/add-new" // مثال لمسار
            className="hidden sm:inline-flex p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 hover:text-sky-600 dark:hover:text-sky-400"
            title={t("navbar.addNew")}
          >
            <FaPlus size={18} />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
