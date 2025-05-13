// src/layouts/Sidebar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaHome, FaUsers, FaSitemap, FaClock, FaPlane, FaMoneyCheckAlt, FaUsersCog, FaFileAlt, FaTachometerAlt,
  FaIdCard, FaUserPlus, FaBuilding, FaBriefcase, FaUserClock, FaMapMarkerAlt, FaFileSignature, FaCheckCircle,
  FaDollarSign, FaPercentage, FaMinusCircle, FaBalanceScale, FaUserLock, FaUser,
  FaAngleLeft, FaAngleRight, FaTimes, FaRegFolderOpen
} from 'react-icons/fa';

// --- 1. تكوين القائمة (Menu Configuration) ---
const menuConfig = [
  // لوحة التحكم الرئيسية
  { 
    id: 'dashboard_main', 
    textKey: 'sidebar.dashboard', 
    icon: FaTachometerAlt, 
    path: '/dashboard',
    end: true // للتأكد من تطابق المسار بدقة
  },
  
  // قسم الموظفين
  {
    id: 'employees', 
    textKey: 'sidebar.personnel', 
    icon: FaUsers, 
    path: '#employees',
    subItems: [
      { 
        id: 'emp_dashboard', 
        textKey: 'sidebar.dashboard', 
        icon: FaTachometerAlt, 
        path: '/employees/dashboard',
        end: true
      },
      { 
        id: 'emp_list', 
        textKey: 'sidebar.staff_data', 
        icon: FaIdCard, 
        path: '/employees/list',
        end: true
      },
      { 
        id: 'emp_add', 
        textKey: 'sidebar.add_employee', 
        icon: FaUserPlus, 
        path: '/employees/add',
        end: true
      },
      { 
        id: 'my_profile', 
        textKey: 'sidebar.my_profile', 
        icon: FaUser, 
        path: '/profile',
        end: true,
        // condition: (user) => user && !user.is_staff && !user.is_superuser 
      },
    ]
  },
  
  // قسم الأقسام والوظائف
  {
    id: 'departments', 
    textKey: 'sidebar.departments_positions', 
    icon: FaSitemap, 
    path: '#departments',
    // condition: (user) => user && (
    //   user.is_superuser || 
    //   user.roles?.includes("Main Manager") || 
    //   user.roles?.includes("HR_MANAGER")
    // ),
    subItems: [
      { 
        id: 'dept_list', 
        textKey: 'sidebar.departments', 
        icon: FaBuilding, 
        path: '/departments/list',
        end: true
      },
      { 
        id: 'pos_list', 
        textKey: 'sidebar.positions', 
        icon: FaBriefcase, 
        path: '/departments/positions',
        end: true
      },
    ]
  },
  
  // قسم الحضور
  {
    id: 'attendance', 
    textKey: 'sidebar.attendance', 
    icon: FaClock, 
    path: '#attendance',
    subItems: [
      {
        id: 'att_dashboard', 
        textKey: 'sidebar.dashboard', 
        icon: FaTachometerAlt, 
        path: '/attendance/dashboard',
        end: true
      },
      {
        id: 'att_shifts', 
        textKey: 'sidebar.shifts', 
        icon: FaUserClock, 
        path: '/attendance/shifts',
        end: true
      },
      {
        id: 'att_scopes', 
        textKey: 'sidebar.attendance_scopes', 
        icon: FaMapMarkerAlt, 
        path: '/attendance/scopes',
        end: true
      },
    ]
  },
  
  // قسم إدارة الإجازات
  {
    id: 'leave_management', 
    textKey: 'sidebar.leave_management', 
    icon: FaPlane, 
    path: '#leave',
    subItems: [
      {
        id: 'leave_dashboard', 
        textKey: 'sidebar.dashboard', 
        icon: FaTachometerAlt, 
        path: '/leave/dashboard',
        end: true
      },
      {
        id: 'leave_requests', 
        textKey: 'sidebar.leave_requests', 
        icon: FaFileSignature, 
        path: '/leave/requests',
        end: true
      },
      {
        id: 'leave_types', 
        textKey: 'sidebar.leave_types', 
        icon: FaFileAlt, 
        path: '/leave/types',
        end: true
      },
      {
        id: 'leave_approvals', 
        textKey: 'sidebar.approvals', 
        icon: FaCheckCircle, 
        path: '/leave/approvals',
        end: true
      },
    ]
  },
  
  // قسم الرواتب
  {
    id: 'payroll', 
    textKey: 'sidebar.payroll', 
    icon: FaMoneyCheckAlt, 
    path: '#payroll',
    subItems: [
      {
        id: 'payroll_dashboard', 
        textKey: 'sidebar.dashboard', 
        icon: FaTachometerAlt, 
        path: '/payroll/dashboard',
        end: true
      },
      {
        id: 'payroll_salaries', 
        textKey: 'sidebar.manage_salaries', 
        icon: FaDollarSign, 
        path: '/payroll/salaries',
        end: true
      },
      {
        id: 'payroll_allowances', 
        textKey: 'sidebar.allowances', 
        icon: FaPercentage, 
        path: '/payroll/allowances',
        end: true
      },
      {
        id: 'payroll_deductions', 
        textKey: 'sidebar.deductions', 
        icon: FaMinusCircle, 
        path: '/payroll/deductions',
        end: true
      },
      {
        id: 'payroll_taxes', 
        textKey: 'sidebar.taxes', 
        icon: FaBalanceScale, 
        path: '/payroll/taxes',
        end: true
      },
    ]
  },
  
  // قسم إدارة المستخدمين
  {
    id: 'users_management', 
    textKey: 'sidebar.users_management', 
    icon: FaUsersCog, 
    path: '#users',
    // condition: (user) => user && (
    //   user.is_superuser || 
    //   user.roles?.includes("HR_MANAGER")
    // ),
    subItems: [
      {
        id: 'users_assign_group', 
        textKey: 'sidebar.assign_groups', 
        icon: FaUsersCog, 
        path: '/users/assign-group',
        end: true,
        // condition: (user) => user?.is_superuser 
      },
      {
        id: 'users_permissions', 
        textKey: 'sidebar.manage_permissions', 
        icon: FaUserLock, 
        path: '/users/permissions',
        end: true,
        // condition: (user) => user?.is_superuser 
      },
    ]
  },
  
  // قسم التقارير
  {
    id: 'reports', 
    textKey: 'sidebar.reports', 
    icon: FaFileAlt, 
    path: '#reports',
    subItems: [
      {
        id: 'reports_employee', 
        textKey: 'sidebar.employee_reports', 
        icon: FaFileAlt, 
        path: '/reports/employees',
        end: true
      },
      {
        id: 'reports_attendance', 
        textKey: 'sidebar.attendance_reports', 
        icon: FaClock, 
        path: '/reports/attendance',
        end: true
      },
      {
        id: 'reports_payroll', 
        textKey: 'sidebar.payroll_reports', 
        icon: FaMoneyCheckAlt, 
        path: '/reports/payroll',
        end: true
      },
      {
        id: 'reports_leave', 
        textKey: 'sidebar.leave_reports', 
        icon: FaPlane, 
        path: '/reports/leave',
        end: true
      },
    ]
  },
  
  // الصفحات الثابتة
  // {
  //   id: 'static_pages', 
  //   textKey: 'sidebar.pages', 
  //   icon: FaRegFolderOpen, 
  //   path: '#static-pages',
  //   subItems: [
  //     { 
  //       id: 'home_page_link', 
  //       textKey: 'sidebar.home', 
  //       icon: FaHome, 
  //       path: '/',
  //       end: true
  //     },
  //   ]
  // },
];

// --- 2. مكون SidebarItem ---
const SidebarItem = React.memo(({ item, isOpen, activeSubMenu, toggleSubMenu, user, isMobileView, onLinkClick }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const dir = i18n.dir();

  // --- نقل Hooks إلى الأعلى ---
  const filteredSubItems = React.useMemo(() => {
      return item.subItems?.filter(sub => !sub.condition || sub.condition(user)) || [];
  }, [item.subItems, user]);

  const hasSubItems = filteredSubItems.length > 0;

  // تعريف calculateIsActive باستخدام useCallback في المستوى الأعلى
  const calculateIsActive = useCallback(() => {
    if (!hasSubItems) {
      if (item.path === '/') return location.pathname === '/';
      return item.end === true ? location.pathname === item.path : location.pathname.startsWith(item.path);
    }
    
    return filteredSubItems.some(subItem => {
      if (subItem.path === '/') return location.pathname === '/';
      
      const subItemPathWithSlash = subItem.path.endsWith('/') ? subItem.path : subItem.path + '/';
      const currentPathWithSlash = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';

      if (subItem.end === true) {
        return location.pathname === subItem.path;
      }
      return currentPathWithSlash.startsWith(subItemPathWithSlash) || location.pathname === subItem.path;
    });
  }, [location.pathname, item, hasSubItems, filteredSubItems]);
  // --- نهاية نقل Hooks ---

  const isSubMenuOpen = activeSubMenu === item.id;
  const IconComponent = item.icon;
  const currentItemIsActive = calculateIsActive(); // استدعاء الدالة المحفوظة

  // الآن يمكن وضع الشرط
  if (item.condition && !item.condition(user)) return null;

  const handleItemClick = (e) => {
    if (hasSubItems && (!item.path || item.path.startsWith('#'))) {
      e.preventDefault();
    }
    
    if (hasSubItems) {
      toggleSubMenu(item.id);
    } else if (onLinkClick) { 
      onLinkClick(); 
    }
  };

  return (
    // ... (باقي JSX لمكون SidebarItem كما كان، لا تغييرات هنا)
    <div className="mb-1">
      <NavLink
        to={item.path && !item.path.startsWith('#') ? item.path : '#'}
        onClick={handleItemClick}
        end={item.end !== undefined ? item.end : !hasSubItems}
        className={() => 
          `flex items-center px-3 py-2.5 rounded-lg cursor-pointer group
           transition-colors duration-150
           ${currentItemIsActive // استخدام القيمة المحسوبة
             ? 'bg-sky-100 dark:bg-sky-600/50 text-sky-700 dark:text-sky-100 font-medium shadow-sm'
             : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/40 hover:text-slate-800 dark:hover:text-slate-100'
           }`
        }
        aria-expanded={hasSubItems ? isSubMenuOpen : undefined}
      >
        {IconComponent && (
          <span className={`w-6 h-6 flex items-center justify-center 
            ${currentItemIsActive // استخدام القيمة المحسوبة
              ? 'text-sky-500 dark:text-sky-300'
              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
            }`}
          >
            <IconComponent size={isOpen || isMobileView ? 18 : 20} />
          </span>
        )}

        {(isOpen || isMobileView) && (
          <span className="flex-1 mx-3 text-sm">{t(item.textKey)}</span>
        )}

        {!(isOpen || isMobileView) && (
          <span className={`absolute z-20 hidden group-hover:block bg-slate-700 dark:bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap
                         top-1/2 transform -translate-y-1/2
                         ${dir === 'rtl' ? 'right-full mr-2' : 'left-full ml-2'}`}>
            {t(item.textKey)}
          </span>
        )}

        {(isOpen || isMobileView) && hasSubItems && (
          dir === 'rtl' ? (
            <FaAngleLeft size={14} className={`text-slate-400 group-hover:text-sky-500 transition-transform duration-200 ${isSubMenuOpen ? '-rotate-90' : ''}`} />
          ) : (
            <FaAngleRight size={14} className={`text-slate-400 group-hover:text-sky-500 transition-transform duration-200 ${isSubMenuOpen ? 'rotate-90' : ''}`} />
          )
        )}
      </NavLink>

      {(isOpen || isMobileView) && hasSubItems && isSubMenuOpen && (
        <div className={`py-1 space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out ${dir === 'rtl' ? 'pr-6 mr-1 border-r-2 border-sky-500/20' : 'pl-6 ml-1 border-l-2 border-sky-500/20'}`}>
          {filteredSubItems.map(subItem => {
            const SubIconComponent = subItem.icon;
            return (
              <NavLink
                key={subItem.id}
                to={subItem.path}
                onClick={() => { if (isMobileView && onLinkClick) onLinkClick(); }}
                end={subItem.end !== undefined ? subItem.end : true}
                className={({ isActive: subNavLinkIsActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-md group
                   ${subNavLinkIsActive
                     ? 'bg-sky-50 dark:bg-sky-600/30 text-sky-600 dark:text-sky-200 font-medium'
                     : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/30 hover:text-slate-700 dark:hover:text-slate-200'
                   }`
                }
              >
                {SubIconComponent && (
                  <SubIconComponent 
                    size={16} 
                    className={`${dir === 'rtl' ? 'ml-3' : 'mr-3'} ${
                      location.pathname === subItem.path 
                        ? 'text-sky-500 dark:text-sky-400' 
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'
                    }`} 
                  />
                )}
                <span>{t(subItem.textKey)}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
});

const Sidebar = ({ isOpen, user, isMobileView = false, onLinkClick }) => {
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const location = useLocation();

  // استخدام useCallback لدالة toggleSubMenu
  const toggleSubMenu = useCallback((menuId) => {
    setActiveSubMenu(prevActiveSubMenu => (prevActiveSubMenu === menuId ? null : menuId));
  }, []);

  // داخل مكون Sidebar
  useEffect(() => {
      const currentPath = location.pathname;
      let foundActiveParentId = null;

      for (const item of menuConfig) {
          if (item.condition && !item.condition(user)) continue;

          const filteredSubItems = item.subItems?.filter(sub => !sub.condition || sub.condition(user)) || [];
          if (filteredSubItems.length > 0) { // فقط إذا كان العنصر له قائمة فرعية مؤهلة
              const isActiveParent = filteredSubItems.some(subItem => {
                  if (subItem.path === '/') return currentPath === '/';

                  // نفس منطق التحقق من البادئة أو التطابق الدقيق كما في calculateIsActive
                  const subItemPathWithSlash = subItem.path.endsWith('/') ? subItem.path : subItem.path + '/';
                  const currentPathWithSlash = currentPath.endsWith('/') ? currentPath : currentPath + '/';

                  if (subItem.end === true) {
                      return currentPath === subItem.path;
                  }
                  return currentPathWithSlash.startsWith(subItemPathWithSlash) || currentPath === subItem.path;
              });
              
              if (isActiveParent) {
                  foundActiveParentId = item.id;
                  break; 
              }
          }
      }
      
      // قم بتحديث activeSubMenu فقط إذا تغير foundActiveParentId
      // هذا يمنع إعادة تعيينه بشكل غير ضروري إذا كان المستخدم قد أغلق القائمة يدويًا
      // ولكن، إذا انتقلنا إلى مسار جديد يجب أن يفتح قائمة مختلفة، فإننا نفتحه.
      // وإذا انتقلنا إلى مسار لا ينتمي لأي قائمة فرعية، فإننا نغلق القائمة المفتوحة حاليًا (foundActiveParentId سيكون null).
      if (activeSubMenu !== foundActiveParentId) {
          setActiveSubMenu(foundActiveParentId);
      }

  }, [location.pathname, user, menuConfig]); // أضفت menuConfig هنا لأنه يُستخدم في الحلقة. أزل activeSubMenu.

  return (
    <aside
      // ... (باقي كود JSX لمكون Sidebar كما هو، لا تغييرات هنا)
      className={`bg-white dark:bg-slate-800 shadow-lg 
                 h-full flex flex-col 
                 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                 ${isMobileView ? 'w-64' : (isOpen ? 'w-64' : 'w-20')}`}
    >
      <div className={`flex items-center border-b border-slate-200/80 dark:border-slate-700/80
                      ${isMobileView ? 'p-4 justify-between h-16' : (isOpen ? 'px-4 justify-start h-[88px]' : 'py-4 justify-center h-[64px]')}`}>
        {isMobileView ? (
          <>
            {user?.logoUrl ? (
              <img src={user.logoUrl} alt={t('sidebar.companyLogoAlt')} className="h-8 object-contain" />
            ) : (
              <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">{t('sidebar.menu')}</span>
            )}
            <button 
              onClick={onLinkClick} 
              className="text-slate-500 dark:text-slate-400 p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
              aria-label={t('navbar.closeMenu', {defaultValue: 'Close menu'})}
            >
              <FaTimes size={20} />
            </button>
          </>
        ) : (
          <Link to={menuConfig.find(item => item.id === 'dashboard_main')?.path || "/dashboard"} className="block group w-full flex justify-center items-center">
            <img
              src={isOpen ? (user?.logoUrl || '/assets/images/logo-full-placeholder.png') : (user?.companyLogoShort || '/assets/images/logo-icon-placeholder.png')}
              alt={t('sidebar.companyLogoAlt')}
              className={`${isOpen ? 'h-10 max-w-[160px]' : 'h-9 w-9'} object-contain transition-all duration-300`}
            />
          </Link>
        )}
      </div>

      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto custom-scrollbar custom-scrollbar-firefox 
          dark:custom-scrollbar-dark dark:custom-scrollbar-firefox-dark">
        {menuConfig.map(item => (
          <SidebarItem
            key={item.id}
            item={item}
            isOpen={isMobileView ? true : isOpen}
            activeSubMenu={activeSubMenu}
            toggleSubMenu={toggleSubMenu} // تمرير النسخة المعمول لها useCallback
            user={user}
            isMobileView={isMobileView}
            onLinkClick={isMobileView ? onLinkClick : undefined} 
          />
        ))}
      </nav>

      {!isMobileView && (
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-700/80 mt-auto">
          {isOpen ? (
            <Link 
              to="/profile" 
              className={`flex items-center rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/40 ${dir === 'rtl' ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}
            >
              <img 
                src={user?.profileImageUrl || '/assets/images/avatar-placeholder.png'} 
                alt={t('sidebar.userAvatarAlt')} 
                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-600" 
              />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
                  {user?.name || t('navbar.guest')}
                </p>
              </div>
            </Link>
          ) : (
            <Link 
              to="/profile" 
              className="w-full flex justify-center p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700/60" 
              title={user?.name || t('navbar.guest')}
            >
              <img 
                src={user?.profileImageUrl || '/assets/images/avatar-placeholder.png'} 
                alt={t('sidebar.userAvatarAlt')} 
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-600" 
              />
            </Link>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;