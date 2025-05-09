// src/App.jsx
import React from 'react';
import Navbar from './layouts/Navbar';
import Sidebar from './layouts/Sidebar';
function App() {
  return (
    <div className="flex h-screen bg-gray-100"> {/* Flex container */}
      <Sidebar /> {/* إضافة Sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden"> {/* محتوى مرن وياخذ باقي المساحة */}
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100"> {/* محتوى قابل للتمرير */}
          <div className="container mx-auto px-6 py-8">
            {/* محتوى الصفحة سيوضع هنا لاحقًا عبر React Router */}
            <h1 className="text-2xl font-semibold text-gray-900">
              مرحباً بك في نظام إدارة الموارد البشرية
            </h1>
            <p className="mt-2 text-gray-600">
              هذا هو المحتوى الرئيسي للصفحة. سيتم استبداله لاحقًا بالصفحات الفعلية.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}


export default App;