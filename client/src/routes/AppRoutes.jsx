// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import App from '../App'; // <-- استيراد App هنا
import RegisterPage from '../features/auth/pages/RegisterPage';

// استيراد مكونات الصفحات (كما هي)
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import EmployeeDashboardPage from '../features/employees/pages/EmployeeDashboardPage';
import EmployeeListPage from '../features/employees/pages/EmployeeListPage';
import EmployeeAddPage from '../features/employees/pages/EmployeeAddPage';
import DepartmentsPage from '../features/departments/pages/DepartmentsPage'; // هذا المسار قد يكون مكررًا أو غير مستخدم إذا كان لديك list و positions
import DepartmentsListPage from '../features/departments/pages/DepartmentsListPage';
import PositionsPage from '../features/departments/pages/PositionsPage';
import AttendanceDashboardPage from '../features/attendance/pages/AttendanceDashboardPage';
import ShiftsPage from '../features/attendance/pages/ShiftsPage';
import ScopesPage from '../features/attendance/pages/ScopesPage';
import LeaveDashboardPage from '../features/leave/pages/LeaveDashboardPage';
import LeaveRequestPage from '../features/leave/pages/LeaveRequestPage';
import LeaveTypesPage from '../features/leave/pages/LeaveTypesPage';
import ApprovalsListPage from '../features/leave/pages/ApprovalsListPage';
import PayrollDashboardPage from '../features/payroll/pages/PayrollDashboardPage';
import ManageSalariesPage from '../features/payroll/pages/ManageSalariesPage';
import AllowancesPage from '../features/payroll/pages/AllowancesPage';
import DeductionsPage from '../features/payroll/pages/DeductionsPage';
// import TaxesPage from '../features/payroll/pages/TaxesPage'; // إذا كان لديك مكون مخصص
import EmployeesReportPage from '../features/reports/pages/EmployeesReportPage';
import AttendanceReportPage from '../features/reports/pages/AttendanceReportPage';
import PayrollReportPage from '../features/reports/pages/PayrollReportPage';
import LeaveReportPage from '../features/reports/pages/LeaveReportPage';
import LoginPage from '../features/auth/pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
// استيراد الصفحات لإدارة المستخدمين إذا كانت موجودة
// import AssignGroupPage from '../features/users/pages/AssignGroupPage';
// import ManagePermissionsPage from '../features/users/pages/ManagePermissionsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} /> {/* <-- إضافة مسار التسجيل */}
      
      <Route path="/" element={
        <ProtectedRoute>
          <App /> {/* App يحتوي على Outlet لعرض المسارات المتداخلة */}
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        <Route path="employees">
          {/* <Route index element={<Navigate to="dashboard" replace />} />  // يمكنك جعل dashboard هو الافتراضي أو list */}
          <Route index element={<EmployeeDashboardPage />} /> {/* أو اجعل list هو الـ index */}
          <Route path="dashboard" element={<EmployeeDashboardPage />} />
          <Route path="list" element={<EmployeeListPage />} />
          <Route path="add" element={<EmployeeAddPage />} />
        </Route>
        
        <Route path="profile" element={<ProfilePage />} />
        
        <Route path="departments">
          {/* <Route index element={<DepartmentsPage />} /> // إذا كان هذا مجرد حاوية، قد لا تحتاجه */}
          <Route index element={<Navigate to="list" replace />} /> {/* توجيه إلى list كافتراضي */}
          <Route path="list" element={<DepartmentsListPage />} />
          <Route path="positions" element={<PositionsPage />} />
        </Route>
        
        <Route path="attendance">
          <Route index element={<AttendanceDashboardPage />} />
          <Route path="dashboard" element={<AttendanceDashboardPage />} />
          <Route path="shifts" element={<ShiftsPage />} />
          <Route path="scopes" element={<ScopesPage />} />
        </Route>
        
        <Route path="leave">
          <Route index element={<LeaveDashboardPage />} />
          <Route path="dashboard" element={<LeaveDashboardPage />} />
          <Route path="requests" element={<LeaveRequestPage />} />
          <Route path="types" element={<LeaveTypesPage />} />
          <Route path="approvals" element={<ApprovalsListPage />} />
        </Route>
        
        <Route path="payroll">
          <Route index element={<PayrollDashboardPage />} />
          <Route path="dashboard" element={<PayrollDashboardPage />} />
          <Route path="salaries" element={<ManageSalariesPage />} />
          <Route path="allowances" element={<AllowancesPage />} />
          <Route path="deductions" element={<DeductionsPage />} />
          <Route path="taxes" element={<div>Taxes Page Content</div>} /> {/* استبدل بمكون حقيقي */}
        </Route>

        <Route path="users">
          <Route index element={<Navigate to="assign-group" replace />} /> {/* أو أي صفحة افتراضية تراها مناسبة */}
          {/* <Route path="assign-group" element={<AssignGroupPage />} /> */}
          {/* <Route path="permissions" element={<ManagePermissionsPage />} /> */}
          <Route path="assign-group" element={<div>Assign Groups Page</div>} /> {/* استبدل بمكون حقيقي */}
          <Route path="permissions" element={<div>Manage Permissions Page</div>} /> {/* استبدل بمكون حقيقي */}
        </Route>
        
        <Route path="reports">
          <Route index element={<Navigate to="employees" replace />} />
          <Route path="employees" element={<EmployeesReportPage />} />
          <Route path="attendance" element={<AttendanceReportPage />} />
          <Route path="payroll" element={<PayrollReportPage />} />
          <Route path="leave" element={<LeaveReportPage />} />
        </Route>

        {/* المسار الرئيسي للصفحة الرئيسية إذا كانت جزءًا من التخطيط المحمي */}
        {/* إذا كان مسار '/' يجب أن يعرض DashboardPage، فإن Navigate في الأعلى يفي بالغرض */}
        {/* إذا كان لديك صفحة رئيسية مخصصة على المسار '/' ضمن التخطيط المحمي، يمكنك تعريفها هنا */}
        {/* مثال: <Route path="/" element={<HomePageWithinLayout />} /> */}
        {/* لكن يبدو أنك تريد /dashboard هو المسار الرئيسي بعد تسجيل الدخول */}

      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;

// --- إنشاء مكونات الصفحات المبدئية (Placeholder Pages) ---
// ضع كل مكون في ملفه الخاص داخل مجلد features المناسب
// مثال: src/features/dashboard/pages/DashboardPage.jsx
// const DashboardPage = () => <div>لوحة التحكم</div>;
// const EmployeeListPage = () => <div>قائمة الموظفين</div>;
// ... وهكذا لبقية الصفحات ...
// const MyProfilePage = () => <div>ملفي الشخصي</div>;
// const DepartmentsPage = () => <div>الأقسام</div>;
// const PositionsPage = () => <div>الوظائف</div>;
// const AttendanceDashboardPage = () => <div>لوحة تحكم الحضور</div>;
// const ShiftsPage = () => <div>الورديات</div>;
// const ScopesPage = () => <div>النطاقات</div>;
// const LeaveDashboardPage = () => <div>لوحة تحكم الإجازات</div>;
// const LeaveRequestPage = () => <div>طلبات الإجازة</div>;
// const LeaveTypesPage = () => <div>أنواع الإجازات</div>;
// const ApprovalsListPage = () => <div>الموافقات</div>;
// const PayrollDashboardPage = () => <div>لوحة تحكم الرواتب</div>;
// const ManageSalariesPage = () => <div>إدارة الرواتب</div>;
// const ReportsPage = () => <div>التقارير</div>;
// const SettingsPage = () => <div>الإعدادات</div>;
// const LoginPage = () => <div>صفحة تسجيل الدخول</div>;
// const NotFoundPage = () => <div>404 - الصفحة غير موجودة</div>;