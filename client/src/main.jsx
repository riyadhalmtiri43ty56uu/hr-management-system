import React from 'react';
import { StrictMode, Suspense } from 'react'; // أضف Suspense للترجمة
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- استيراد BrowserRouter
import './styles.css';
// import App from './App.jsx';
import AppRoutes from './routes/AppRoutes';
import './config/i18n'; // استيراد إعدادات i18next (سيتم إنشاؤها في الخطوة 3)
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* <-- لف التطبيق بـ BrowserRouter */}
      <Suspense fallback={<div>Loading...</div>}> {/* <-- غلاف Suspense للترجمة */}
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
