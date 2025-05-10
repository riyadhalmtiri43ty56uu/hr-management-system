// src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './layouts/Navbar';
import Sidebar from './layouts/Sidebar';

function App() {
  // --- الحالة العامة للتطبيق ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // للشاشات الكبيرة
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // للهواتف

  // الوضع الداكن/الفاتح
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    // إذا لم يكن هناك وضع محفوظ، تحقق من تفضيلات النظام
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // اللغة الحالية
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ar'; // الافتراضي 'ar'
  });

  // --- التأثيرات الجانبية (Side Effects) ---
  useEffect(() => {
    // تطبيق الوضع الداكن/الفاتح على <html>
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));

    // تطبيق اتجاه اللغة على <html>
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', currentLanguage);

  }, [isDarkMode, currentLanguage]);


  // --- دوال تبديل الحالة ---
  const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);
  const toggleMainSidebar = () => setIsSidebarOpen(prevOpen => !prevOpen);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prevOpen => !prevOpen);

  const switchLanguage = (lang) => {
    setCurrentLanguage(lang);
    // أغلق الشريط الجانبي للهاتف عند تغيير اللغة إذا كان مفتوحًا (اختياري)
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    console.log("User logged out");
    // TODO: Implement actual logout logic (clear token, redirect, etc.)
  };

  // --- بيانات وهمية للمستخدم (استبدلها ببيانات حقيقية من API) ---
  const currentUser = {
    name: "يوسف أحمد",
    profileImageUrl: "/assets/images/avatar-placeholder.png", // ضع صورة في public/assets/images
    logoUrl: "/assets/images/logo-placeholder.svg",       // ضع شعارًا في public/assets/images
    roles: ['admin'] // مثال للأدوار
  };

  return (
    <div className={`flex h-screen antialiased text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 overflow-hidden`}>
      {/* Sidebar for larger screens (lg and up) */}
      <div className="hidden lg:flex"> {/* استخدمنا flex هنا بدلًا من وضع fixed مباشرة في Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          user={currentUser}
          currentLanguage={currentLanguage}
          // onToggle={toggleMainSidebar} // إذا كان زر التبديل داخل الشريط نفسه
        />
      </div>

      {/* Mobile Sidebar (Overlay and Drawer) */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        ></div>
      )}
      <div
        className={`fixed inset-y-0 z-40 flex w-64 transform flex-col bg-white dark:bg-slate-800 shadow-xl
                   transition-transform duration-300 ease-in-out lg:hidden
                   ${currentLanguage === 'ar' ? 'right-0' : 'left-0'}
                   ${isMobileSidebarOpen
                      ? 'translate-x-0'
                      : (currentLanguage === 'ar' ? 'translate-x-full' : '-translate-x-full')
                   }`}
      >
        <Sidebar
          isOpen={true} // Mobile sidebar is always "fully open" in its container
          user={currentUser}
          isMobileView={true}
          currentLanguage={currentLanguage}
          onLinkClick={toggleMobileSidebar} // لإغلاق الشريط عند النقر على رابط
        />
      </div>

      {/* Main Content Area (Navbar + Page Content) */}
      <div
        className={`flex-1 flex flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out
                   lg:${currentLanguage === 'ar' ? (isSidebarOpen ? 'mr-64' : 'mr-20') : (isSidebarOpen ? 'ml-64' : 'ml-20')}`}
      >
        <Navbar
          onToggleMobileSidebar={toggleMobileSidebar}
          onToggleMainSidebar={toggleMainSidebar}
          isMainSidebarOpen={isSidebarOpen}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          currentLanguage={currentLanguage}
          switchLanguage={switchLanguage}
          user={currentUser}
          onLogout={handleLogout}
          breadcrumb="لوحة التحكم" // سيتم تحديث هذا لاحقًا بـ React Router
        />
        <main className="flex-1 p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50"> {/* ألوان خلفية أفتح للمحتوى */}
          <div className="container mx-auto">
            {/* --- مثال لمحتوى الصفحة --- */}
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
              أهلاً بك، {currentUser.name}!
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-lg font-semibold text-sky-600 dark:text-sky-400 mb-2">مهمة سريعة</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">هنا يمكنك وضع محتوى تجريبي لبطاقة.</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">إحصائيات</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">عدد المستخدمين النشطين: 150</p>
              </div>
            </div>
            {/* --- نهاية مثال محتوى الصفحة --- */}
            {/* سيتم عرض مكونات الصفحات الفعلية هنا بواسطة React Router لاحقًا */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;