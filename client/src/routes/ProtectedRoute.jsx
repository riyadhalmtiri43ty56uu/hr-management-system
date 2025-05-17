// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth'; // سنستخدم هذا الخطاف لاحقًا

const ProtectedRoute = ({ children }) => {
  // --- منطق التحقق من المصادقة (مؤقت) ---
  // لاحقًا، ستتحقق من حالة المصادقة من AuthContext أو localStorage
  const isAuthenticated = true; // !! افتراض أن المستخدم مسجل دخوله مؤقتًا
  // const { isAuthenticated } = useAuth(); // الطريقة الأفضل لاحقًا

  if (!isAuthenticated) {
    // إذا لم يكن المستخدم مسجلاً دخوله، قم بإعادة توجيهه لصفحة تسجيل الدخول
    // مع حفظ المسار الذي كان يحاول الوصول إليه (للعودة إليه بعد تسجيل الدخول)
    return <Navigate to="/login" replace />;
    // replace={true} يمنع المستخدم من العودة للصفحة المحمية بزر الرجوع في المتصفح
  }

  // إذا كان المستخدم مسجلاً دخوله، اعرض المحتوى المطلوب (الصفحة المحمية)
  // <Outlet /> هو المكان الذي سيتم فيه عرض مكون Route المتداخل
  return children ? children : <Outlet />;
};

export default ProtectedRoute;