// src/App.jsx
import React, { useState, useEffect, Suspense } from 'react'; // Suspense if using lazy loading for translations
import { Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar'; // تأكد من صحة المسار
import Sidebar from './components/layout/Sidebar'; // تأكد من صحة المسار
import { useTranslation } from 'react-i18next'; // لاستخدام i18n مباشرة

function App() {
  const { i18n } = useTranslation(); // الحصول على i18n instance

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) return JSON.parse(savedMode);
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // currentLanguage الآن يُدار بواسطة i18next بشكل أساسي
  // لكننا نحتفظ به في الحالة لإجبار إعادة العرض عند الحاجة (باستخدام key)
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'ar');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLanguage(lng); // تحديث حالتنا المحلية
      document.documentElement.lang = lng;
      document.documentElement.dir = i18n.dir(lng); // استخدام i18n.dir(lng) لضمان الاتجاه الصحيح
      localStorage.setItem('language', lng);
    };

    // تطبيق الإعدادات الأولية
    handleLanguageChanged(i18n.language);

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);


  const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);
  const toggleMainSidebar = () => setIsSidebarOpen(prevOpen => !prevOpen);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prevOpen => !prevOpen);

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang).then(() => {
      // setCurrentLanguage سيتم تحديثه عبر مستمع 'languageChanged'
      if (isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    });
  };

  const handleLogout = () => {
    console.log("User logged out");
    // TODO: Implement actual logout logic
  };

  const currentUser = {
    name: "يوسف أحمد",
    profileImageUrl: "/assets/images/avatar-placeholder.png",
    logoUrl: "/assets/images/logo-placeholder.svg",
    companyLogoShort: "/assets/images/logo-icon-placeholder.png", // افترض أن هذا موجود للشعار المصغر
    roles: ['admin'],
    is_staff: true, // أضف هذه الخصائص إذا كانت الشروط في Sidebar تعتمد عليها
    is_superuser: false,
  };

  return (
    // إضافة key هنا لإجبار إعادة عرض App بالكامل عند تغيير اللغة
    // هذا يساعد في تحديث أي عناصر تعتمد على الاتجاه (dir)
    <div 
      key={currentLanguage} // مفتاح مهم لإعادة العرض عند تغيير اللغة
      className={`flex h-screen antialiased text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 overflow-hidden`}
      dir={i18n.dir(currentLanguage)} // ضبط dir مباشرة هنا أيضًا
    >
      {/* Sidebar for larger screens */}
      <div className="hidden lg:flex">
        <Sidebar
          // إضافة key هنا أيضًا لضمان إعادة بناء Sidebar إذا لزم الأمر
          key={`desktop-sidebar-${currentLanguage}`} 
          isOpen={isSidebarOpen}
          user={currentUser}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        ></div>
      )}
      {/* Mobile Sidebar Drawer */}
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
          // إضافة key هنا أيضًا
          key={`mobile-sidebar-${currentLanguage}`}
          isOpen={true} 
          user={currentUser}
          isMobileView={true}
          onLinkClick={toggleMobileSidebar}
        />
      </div>

      {/* Main Content Area */}
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
          // breadcrumb prop سيتم تحديثه لاحقًا بواسطة react-router أو context
        />
        <main className="flex-1 p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50">
          <div className="container mx-auto">
            {/* Suspense مطلوب إذا كنت تستخدم lazy loading للمسارات أو الترجمات */}
            <Suspense fallback={<div>Loading page...</div>}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;