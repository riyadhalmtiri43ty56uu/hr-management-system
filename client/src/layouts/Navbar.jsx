// src/layouts/Navbar.jsx
import React from 'react';

const Navbar = () => {
return (
<nav className="bg-white shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
        <a href="/" className="flex-shrink-0 text-xl font-bold text-blue-600">
            نظام HR
        </a>
        </div>
        <div className="hidden md:block">
        <div className="ml-10 flex items-baseline space-x-4">
            {/* روابط Navbar هنا - مثال */}
            <a
            href="#"
            className="text-gray-700 hover:bg-gray-200 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
            >
            لوحة التحكم
            </a>
            <a
            href="#"
            className="text-gray-700 hover:bg-gray-200 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
            >
            الموظفين
            </a>
        </div>
        </div>
        <div className="flex items-center">
        {/* أيقونة المستخدم أو زر تسجيل الدخول */}
        <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
            <span className="sr-only">View notifications</span>
            {/* يمكنك استخدام أيقونة هنا (مثلاً من مكتبة أيقونات) */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        </button>
        {/* قائمة منسدلة للمستخدم */}
        </div>
        <div className="-mr-2 flex md:hidden"> {/* زر القائمة للهواتف */}
        <button
            type="button"
            className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-controls="mobile-menu"
            aria-expanded="false"
        >
            <span className="sr-only">Open main menu</span>
            {/* أيقونة الهمبرغر */}
            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {/* أيقونة الإغلاق (X) */}
            <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        </div>
    </div>
    </div>

    {/* قائمة الهاتف المحمول، تظهر/تختفي بناءً على الحالة */}
    <div className="md:hidden" id="mobile-menu">
    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <a href="#" className="text-gray-700 hover:bg-gray-200 hover:text-black block px-3 py-2 rounded-md text-base font-medium">لوحة التحكم</a>
        <a href="#" className="text-gray-700 hover:bg-gray-200 hover:text-black block px-3 py-2 rounded-md text-base font-medium">الموظفين</a>
    </div>
    </div>
</nav>
);
};

export default Navbar;