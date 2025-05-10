// src/layouts/Sidebar.jsx
import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom'; // تفعيلها لاحقًا
import {
  FaHome, FaUsers, FaSitemap, FaClock, FaPlane, FaMoneyCheckAlt, FaUsersCog, FaFileAlt, FaTachometerAlt,
  FaIdCard, FaUserPlus, FaBuilding, FaBriefcase, FaUserClock, FaMapMarkerAlt, FaFileSignature, FaCheckCircle,
  FaDollarSign, FaPercentage, FaMinusCircle, FaBalanceScale, FaUserLock, FaUser,
  FaAngleLeft, FaAngleRight, FaTimes, FaRegFolderOpen
} from 'react-icons/fa'; // استيراد أيقونات Font Awesome

// --- Menu Configuration ---
const menuConfig = [
  {
    id: 'pages', textKey: 'pages', icon: FaRegFolderOpen, path: '/home',
    subItems: [
      { id: 'home', textKey: 'home', icon: FaHome, path: '/home' },
    ]
  },
  {
    id: 'employees', textKey: 'personnel', icon: FaUsers, path: '/employees/dashboard',
    subItems: [
      { id: 'emp_dashboard', textKey: 'dashboard', icon: FaTachometerAlt, path: '/employees/dashboard' },
      { id: 'emp_list', textKey: 'staff_data', icon: FaIdCard, path: '/employees' },
      { id: 'emp_add', textKey: 'add_employee', icon: FaUserPlus, path: '/employees/add' },
      { id: 'my_profile', textKey: 'my_profile', icon: FaUser, path: '/profile', condition: (user) => user && !user.is_staff && !user.is_superuser /* && user.employee_set_exists */ },
    ]
  },
  {
    id: 'departments', textKey: 'departments_positions', icon: FaSitemap, path: '/departments',
    condition: (user) => user && (user.is_superuser || user.roles?.includes("Main Manager") || user.roles?.includes("HR Manager")),
    subItems: [
      { id: 'dept_list', textKey: 'departments', icon: FaBuilding, path: '/departments' },
      { id: 'pos_list', textKey: 'positions', icon: FaBriefcase, path: '/positions' },
    ]
  },
  {
    id: 'attendance', textKey: 'attendance', icon: FaClock, path: '/attendance/dashboard',
    subItems: [
        {id: 'att_dashboard', textKey: 'dashboard', icon: FaTachometerAlt, path: '/attendance/dashboard'},
        {id: 'att_shifts', textKey: 'shifts', icon: FaUserClock, path: '/attendance/shifts'},
        {id: 'att_scopes', textKey: 'attendance_scopes', icon: FaMapMarkerAlt, path: '/attendance/scopes'},
    ]
  },
  {
    id: 'leave_management', textKey: 'leave_management', icon: FaPlane, path: '/leave/dashboard',
    subItems: [
        {id: 'leave_dashboard', textKey: 'dashboard', icon: FaTachometerAlt, path: '/leave/dashboard'},
        {id: 'leave_requests', textKey: 'leave_requests', icon: FaFileSignature, path: '/leave/requests'},
        {id: 'leave_types', textKey: 'leave_types', icon: FaFileAlt, path: '/leave/types'},
        {id: 'leave_approvals', textKey: 'approvals', icon: FaCheckCircle, path: '/leave/approvals'},
    ]
  },
  {
    id: 'payroll', textKey: 'payroll', icon: FaMoneyCheckAlt, path: '/payroll/dashboard',
    subItems: [
        {id: 'payroll_dashboard', textKey: 'dashboard', icon: FaTachometerAlt, path: '/payroll/dashboard'},
        {id: 'payroll_salaries', textKey: 'manage_salaries', icon: FaDollarSign, path: '/payroll/salaries'},
        {id: 'payroll_allowances', textKey: 'allowances', icon: FaPercentage, path: '/payroll/allowances'},
        {id: 'payroll_deductions', textKey: 'deductions', icon: FaMinusCircle, path: '/payroll/deductions'},
        {id: 'payroll_taxes', textKey: 'taxes', icon: FaBalanceScale, path: '/payroll/taxes'},
    ]
  },
  {
    id: 'users_management', textKey: 'users_management', icon: FaUsersCog, path: '/users',
    condition: (user) => user && (user.is_superuser || user.roles?.includes("HR_MANAGER")), // مثال لـ role
    subItems: [
        {id: 'users_assign_group', textKey: 'assign_groups', icon: FaUsersCog, path: '/users/assign-group', condition: (user) => user?.is_superuser },
        {id: 'users_permissions', textKey: 'manage_permissions', icon: FaUserLock, path: '/users/permissions', condition: (user) => user?.is_superuser },
        // ... المزيد من عناصر المستخدمين
    ]
  },
  {
    id: 'reports', textKey: 'reports', icon: FaFileAlt, path: '/reports/employees',
    subItems: [
        {id: 'reports_employee', textKey: 'employee_reports', icon: FaFileAlt, path: '/reports/employees'},
        {id: 'reports_attendance', textKey: 'attendance_reports', icon: FaClock, path: '/reports/attendance'},
        {id: 'reports_payroll', textKey: 'payroll_reports', icon: FaMoneyCheckAlt, path: '/reports/payroll'},
        {id: 'reports_leave', textKey: 'leave_reports', icon: FaPlane, path: '/reports/leave'},
    ]
  },
];

// --- قاموس الترجمة (مثال بسيط، استخدم i18next لمشروع حقيقي) ---
const translations = {
  ar: {
    pages: 'الصفحات', home: 'الرئيسية', personnel: 'شؤون الموظفين', dashboard: 'لوحة التحكم', staff_data: 'بيانات الموظفين',
    add_employee: 'إضافة موظف', my_profile: 'ملفي الشخصي', departments_positions: 'الأقسام والوظائف', departments: 'الأقسام',
    positions: 'الوظائف', attendance: 'الحضور', shifts: 'الورديات', attendance_scopes: 'نطاقات الحضور',
    leave_management: 'إدارة الإجازات', leave_requests: 'طلبات الإجازة', leave_types: 'أنواع الإجازات',
    approvals: 'الموافقات', payroll: 'الرواتب', manage_salaries: 'إدارة الرواتب', allowances: 'البدلات',
    deductions: 'الخصومات', taxes: 'الضرائب', users_management: 'إدارة المستخدمين', assign_groups: 'تعيين المجموعات',
    manage_permissions: 'إدارة الصلاحيات', reports: 'التقارير', employee_reports: 'تقارير الموظفين',
    attendance_reports: 'تقارير الحضور', payroll_reports: 'تقارير الرواتب', leave_reports: 'تقارير الإجازات',
    menu: 'القائمة', company_logo_alt: 'شعار الشركة', user_avatar_alt: 'الصورة الرمزية للمستخدم'
  },
  en: {
    pages: 'Pages', home: 'Home', personnel: 'Personnel', dashboard: 'Dashboard', staff_data: 'Staff Data',
    add_employee: 'Add Employee', my_profile: 'My Profile', departments_positions: 'Departments & Positions', departments: 'Departments',
    positions: 'Positions', attendance: 'Attendance', shifts: 'Shifts', attendance_scopes: 'Attendance Scopes',
    leave_management: 'Leave Management', leave_requests: 'Leave Requests', leave_types: 'Leave Types',
    approvals: 'Approvals', payroll: 'Payroll', manage_salaries: 'Manage Salaries', allowances: 'Allowances',
    deductions: 'Deductions', taxes: 'Taxes', users_management: 'Users Management', assign_groups: 'Assign Groups',
    manage_permissions: 'Manage Permissions', reports: 'Reports', employee_reports: 'Employee Reports',
    attendance_reports: 'Attendance Reports', payroll_reports: 'Payroll Reports', leave_reports: 'Leave Reports',
    menu: 'Menu', company_logo_alt: 'Company Logo', user_avatar_alt: 'User Avatar'
  }
};

const SidebarItem = ({ item, isOpen, activeSubMenu, toggleSubMenu, user, isMobileView, onLinkClick, currentLanguage }) => {
  const t = (key) => translations[currentLanguage]?.[key] || key; // دالة ترجمة بسيطة
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isSubMenuOpen = activeSubMenu === item.id;
  // const location = useLocation(); // لتحديد الرابط النشط لاحقًا
  const isActive = false; // لاحقًا: hasSubItems ? location.pathname.startsWith(item.path) : location.pathname === item.path;

  if (item.condition && !item.condition(user)) return null;

  const handleItemClick = () => {
    // e.preventDefault(); // منع السلوك الافتراضي للرابط إذا كنا سنتعامل مع التنقل برمجيًا أو إذا كان مجرد زر لفتح القائمة
    if (hasSubItems) {
      toggleSubMenu(item.id);
    } else if (onLinkClick) {
      onLinkClick();
    }
    // لاحقًا: التنقل باستخدام React Router
  };

  const ItemLink = ({ to, children, className, ...props }) => <a href={to || '#!'} onClick={handleItemClick} className={className} {...props}>{children}</a>;
  const IconComponent = item.icon;
  const dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      <ItemLink
        to={!hasSubItems ? item.path : undefined}
        className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer group
                    text-slate-600 dark:text-slate-300
                    hover:bg-sky-100 dark:hover:bg-sky-700/40
                    hover:text-sky-600 dark:hover:text-sky-300
                    transition-colors duration-150
                    ${isActive && !isSubMenuOpen ? 'bg-sky-100 dark:bg-sky-600/50 text-sky-700 dark:text-sky-100 font-medium' : ''}`}
      >
        <span className={`w-6 h-6 flex items-center justify-center ${isActive ? 'text-sky-500 dark:text-sky-300' : 'text-slate-400 dark:text-slate-500 group-hover:text-sky-500 dark:group-hover:text-sky-400'}`}>
          {IconComponent && <IconComponent size={isOpen || isMobileView ? 18 : 20} />}
        </span>
        {(isOpen || isMobileView) && <span className={`flex-1 mx-3 text-sm`}>{t(item.textKey)}</span>}
        {!(isOpen || isMobileView) && (
          <span className={`absolute z-20 hidden group-hover:block bg-slate-700 dark:bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap
                           top-1/2 transform -translate-y-1/2
                           ${dir === 'rtl' ? 'right-full mr-2' : 'left-full ml-2'}`}>
            {t(item.textKey)}
          </span>
        )}
        {(isOpen || isMobileView) && hasSubItems && (
          dir === 'rtl' ?
            <FaAngleLeft size={14} className={`text-slate-400 group-hover:text-sky-500 transition-transform duration-200 ${isSubMenuOpen ? '-rotate-90' : ''}`} /> :
            <FaAngleRight size={14} className={`text-slate-400 group-hover:text-sky-500 transition-transform duration-200 ${isSubMenuOpen ? 'rotate-90' : ''}`} />
        )}
      </ItemLink>

      {(isOpen || isMobileView) && hasSubItems && isSubMenuOpen && (
        <div className={`py-1 space-y-0.5 ${dir === 'rtl' ? 'pr-5 mr-1 border-r-2 border-sky-500/30' : 'pl-5 ml-1 border-l-2 border-sky-500/30'}`}>
          {item.subItems.map(subItem => {
            if (subItem.condition && !subItem.condition(user)) return null;
            const SubIconComponent = subItem.icon;
            // const isSubActive = location.pathname === subItem.path; // لاحقًا
            const isSubActive = false;
            return (
              <a
                key={subItem.id}
                href={subItem.path || '#!'}
                onClick={onLinkClick}
                className={`flex items-center px-3 py-2 text-sm rounded-md group
                            ${isSubActive ? 'bg-sky-50 dark:bg-sky-600/30 text-sky-600 dark:text-sky-200 font-medium' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/40 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                {SubIconComponent && <SubIconComponent size={16} className={`mr-3 rtl:ml-3 ${isSubActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-500'}`} />}
                <span>{t(subItem.textKey)}</span>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
};

const Sidebar = ({ isOpen, user, isMobileView = false, onLinkClick, currentLanguage }) => {
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const t = (key) => translations[currentLanguage]?.[key] || key;
  const dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

  const toggleSubMenu = (menuId) => {
    setActiveSubMenu(activeSubMenu === menuId ? null : menuId);
  };

  return (
    <aside
      className={`bg-white dark:bg-slate-800 shadow-lg 
                 h-full flex flex-col 
                 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                 ${isMobileView ? 'w-64' : (isOpen ? 'w-64' : 'w-20')}`}
    >
      <div className={`flex items-center border-b border-slate-200/80 dark:border-slate-700/80
                      ${isMobileView ? 'p-4 justify-between h-16' : (isOpen ? 'px-4 justify-start h-[88px]' : 'py-4 justify-center h-[64px]')}`}>
        {isMobileView ? (
          <>
            {user?.logoUrl && <img src={user.logoUrl} alt={t('company_logo_alt')} className="h-8 object-contain" />}
            <button onClick={onLinkClick} className="text-slate-500 dark:text-slate-400 p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60">
              <FaTimes size={20} />
            </button>
          </>
        ) : (
          <a href={user?.profileUrl || "#"} className="block group w-full flex justify-center items-center">
            <img
              src={isOpen ? (user?.logoUrl || '/assets/images/logo-full-placeholder.png') : (user?.companyLogoShort || '/assets/images/logo-icon-placeholder.png')}
              alt={t('company_logo_alt')}
              className={`${isOpen ? 'h-10 max-w-[160px]' : 'h-9 w-9'} object-contain transition-all duration-300`}
            />
          </a>
        )}
      </div>

      <nav className="flex-1 px-2.5 py-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500">
        {menuConfig.map(item => (
          <SidebarItem
            key={item.id}
            item={item}
            isOpen={isMobileView ? true : isOpen}
            activeSubMenu={activeSubMenu}
            toggleSubMenu={toggleSubMenu}
            user={user}
            isMobileView={isMobileView}
            onLinkClick={onLinkClick}
            currentLanguage={currentLanguage}
          />
        ))}
      </nav>

      {!isMobileView && (
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-700/80 mt-auto">
          {isOpen ? (
            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <img src={user?.profileImageUrl || '/assets/images/avatar-placeholder.png'} alt={t('user_avatar_alt')} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{user?.name}</p>
              </div>
            </div>
          ) : (
            <button className="w-full flex justify-center p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60" title={user?.name}>
              <img src={user?.profileImageUrl || '/assets/images/avatar-placeholder.png'} alt={t('user_avatar_alt')} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-600" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;