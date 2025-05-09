// src/layouts/Sidebar.jsx
import React, { useState } from 'react';

// يمكنك استيراد أيقونات إذا أردت
// import { FaTachometerAlt, FaUsers, FaUserTie } from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // للتحكم في فتح/إغلاق الشريط الجانبي (اختياري)

  // يمكنك جعل هذا ديناميكيًا لاحقًا
  const menuItems = [
    { name: 'لوحة التحكم', path: '/dashboard', icon: '📊' /* <FaTachometerAlt /> */ },
    { name: 'الموظفون', path: '/employees', icon: '👥' /* <FaUsers /> */ },
    { name: 'الأقسام', path: '/departments', icon: '🏢' /* <FaUserTie /> */ },
    { name: 'الحضور', path: '/attendance', icon: '⏱️' },
    { name: 'الرواتب', path: '/payroll', icon: '💰' },
    // ... أضف بقية التطبيقات من مشروعك
  ];

  return (
    <aside
      className={`bg-gray-800 text-gray-100 h-screen transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      } hidden md:block`} // يختفي على الشاشات الصغيرة، يمكن تعديل هذا السلوك
    >
      <div className="p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white focus:outline-none mb-4 float-right"
          title={isOpen ? "إغلاق الشريط" : "فتح الشريط"}
        >
          {isOpen ? '‹' : '›'} {/* يمكنك استخدام أيقونات أفضل هنا */}
        </button>
        <h2 className={`text-2xl font-semibold ${!isOpen && 'hidden'}`}>القائمة</h2>
      </div>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-1">
              <a
                href={item.path} // لاحقًا سنستخدم <Link> من react-router-dom
                className={`flex items-center py-2 px-4 rounded transition-colors duration-200
                            hover:bg-gray-700 hover:text-white
                            ${
                              window.location.pathname === item.path // تحديد العنصر النشط (مؤقتًا)
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-400'
                            }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className={`${!isOpen && 'hidden'}`}>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
