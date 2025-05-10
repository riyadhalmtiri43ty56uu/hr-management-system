// src/App.jsx (أو أي مكون آخر)
import React, { useState, useEffect } from 'react';
import Navbar from './layouts/Navbar';
import Sidebar from './layouts/Sidebar';
import Button from './components/ui/Button'; // استيراد الزر
import Modal from './components/ui/Modal';   // استيراد المودال

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverMessage, setServerMessage] = useState(''); // حالة لتخزين رسالة الخادم

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // جلب البيانات من الخادم عند تحميل المكون
  useEffect(() => {
    fetch('http://localhost:5000/api/test') 
    .then(response => response.json())
    .then(data => setServerMessage(data.message))
    .catch(error => console.error('Error fetching data:', error));
  }, []); // المصفوفة الفارغة تعني أن التأثير سيُنفذ مرة واحدة بعد أول عرض
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              مرحباً بك في نظام إدارة الموارد البشرية
            </h1>
            <p className='mt-2 text-gray-600'>
              {serverMessage || "جاري تحميل الرسالة من الخادم..."} {/* عرض رسالة الخادم */}
            </p>
            <Button onClick={openModal} variant="primary" className="mt-4">
              فتح مودال تجريبي
            </Button>

            {/* المودال */}
            <Modal
              isOpen={isModalOpen}
              onClose={closeModal}
              title="مودال تجريبي"
              size="md" // جرب أحجام مختلفة: 'sm', 'lg', 'xl'
              footerContent={
                <>
                  <Button variant="outline" onClick={closeModal}>إلغاء</Button>
                  <Button variant="primary" onClick={() => { alert('تم الحفظ!'); closeModal(); }}>حفظ التغييرات</Button>
                </>
              }
            >
              <p>هذا هو محتوى المودال. يمكنك وضع أي شيء هنا، مثل نموذج إدخال.</p>
              <input type="text" className="mt-2 p-2 border rounded w-full" placeholder="أدخل نصًا..." />
            </Modal>
          </div>
        </main>
      </div>
    </div>
  );
}
export default App;