// src/features/auth/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate للتوجيه بعد النجاح
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../config/axiosInstance'; // استيراد axiosInstance
// import { useAuth } from '../../../hooks/useAuth'; // سنستخدم هذا لاحقًا لتحديث حالة المصادقة

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // const { login } = useAuth(); // دالة لتحديث حالة المصادقة في Context (لاحقًا)

  // --- 1. إدارة حالة حقول النموذج ---
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '', // (اختياري) لتأكيد كلمة المرور
    firstName: '',
    lastName: '',
  });

  // --- 2. إدارة حالة التحميل والأخطاء ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // لتخزين رسالة الخطأ العامة من API
  const [validationErrors, setValidationErrors] = useState({}); // لتخزين أخطاء التحقق من الحقول

  // --- 3. دالة لتحديث حالة النموذج عند تغيير المدخلات ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    // إزالة خطأ التحقق من الصحة للحقل عند بدء الكتابة فيه مرة أخرى
    if (validationErrors[name]) {
      setValidationErrors(prevErrors => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  // --- 4. دالة لمعالجة إرسال النموذج ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // منع السلوك الافتراضي لإرسال النموذج
    setError(null); // إعادة تعيين الأخطاء العامة
    setValidationErrors({}); // إعادة تعيين أخطاء التحقق

    // (اختياري) التحقق من تطابق كلمتي المرور في الواجهة الأمامية
    if (formData.password !== formData.confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: t('auth.passwordsDoNotMatch') }));
      return;
    }

    setIsLoading(true); // بدء التحميل

    try {
      // تجهيز البيانات للإرسال (استبعاد confirmPassword إذا لم يكن جزءًا من API payload)
      const {  ...payload } = formData;
      // إذا كانت الحقول الاختيارية فارغة، قد ترغب في عدم إرسالها أو إرسالها كـ null
      // بناءً على كيفية تعامل API معها. حاليًا، سيرسلها كما هي.
      // payload.firstName = payload.firstName || undefined; // مثال لإرسال undefined إذا كان فارغًا
      // payload.lastName = payload.lastName || undefined;

      // إرسال طلب POST إلى API
      const response = await axiosInstance.post('/auth/register', payload);

      console.log('Registration successful:', response.data);
      // TODO: لاحقًا، ستقوم بحفظ التوكن وتحديث AuthContext هنا
      // مثال: login(response.data.token, response.data.user); // إذا كانت API ترجع توكن عند التسجيل

      // توجيه المستخدم إلى صفحة تسجيل الدخول أو لوحة التحكم بعد التسجيل الناجح
      // يمكنك عرض رسالة نجاح أولاً
      alert(t('auth.registrationSuccessMessage') || 'Registration successful! Please log in.'); // رسالة مؤقتة
      navigate('/login'); // التوجيه إلى صفحة تسجيل الدخول

    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data) {
        const apiError = err.response.data;
        // تعيين رسالة الخطأ العامة
        setError(apiError.message || t('auth.registrationFailed'));

        // تعيين أخطاء التحقق من الحقول إذا كانت موجودة
        if (apiError.errors && Array.isArray(apiError.errors)) {
          const fieldErrors = {};
          apiError.errors.forEach(fieldErr => {
            // افترض أن apiError.errors يحتوي على كائنات مثل { path: "email", message: "Invalid email" }
            // قد تحتاج لتكييف هذا بناءً على هيكل رسائل الخطأ من Zod/Express
            if (fieldErr.path) {
              fieldErrors[fieldErr.path.split('.').pop()] = fieldErr.message; // path قد يكون "body.email"
            }
          });
          setValidationErrors(fieldErrors);
        } else if (apiError.message.toLowerCase().includes('email already in use')) {
            setValidationErrors({ email: t('auth.emailInUse') });
        } else if (apiError.message.toLowerCase().includes('username already in use')) {
            setValidationErrors({ username: t('auth.usernameInUse') });
        }

      } else {
        setError(t('auth.networkError'));
      }
    } finally {
      setIsLoading(false); // إيقاف التحميل
    }
  };

  // --- 5. بنية JSX للنموذج ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">
          {t('auth.createAccount')}
        </h2>

        {/* عرض رسالة الخطأ العامة */}
        {error && !Object.keys(validationErrors).length && ( // اعرض الخطأ العام فقط إذا لم تكن هناك أخطاء حقول محددة
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* حقل اسم المستخدم */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('auth.username')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                          ${validationErrors.username ? 'border-red-500 dark:border-red-600 focus:ring-red-500/50' : 'border-slate-300 dark:border-slate-600 focus:ring-sky-500/50 dark:focus:border-sky-500'} 
                          bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
              placeholder={t('auth.enterUsername')}
            />
            {validationErrors.username && <p className="text-xs text-red-500 mt-1">{validationErrors.username}</p>}
          </div>

          {/* حقل البريد الإلكتروني */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('auth.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                          ${validationErrors.email ? 'border-red-500 dark:border-red-600 focus:ring-red-500/50' : 'border-slate-300 dark:border-slate-600 focus:ring-sky-500/50 dark:focus:border-sky-500'}
                          bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
              placeholder={t('auth.enterEmail')}
            />
            {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
          </div>

          {/* حقل كلمة المرور */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('auth.password')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                          ${validationErrors.password ? 'border-red-500 dark:border-red-600 focus:ring-red-500/50' : 'border-slate-300 dark:border-slate-600 focus:ring-sky-500/50 dark:focus:border-sky-500'}
                          bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
              placeholder={t('auth.enterPassword')}
            />
            {validationErrors.password && <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>}
          </div>

          {/* حقل تأكيد كلمة المرور */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('auth.confirmPassword')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                          ${validationErrors.confirmPassword ? 'border-red-500 dark:border-red-600 focus:ring-red-500/50' : 'border-slate-300 dark:border-slate-600 focus:ring-sky-500/50 dark:focus:border-sky-500'}
                          bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
              placeholder={t('auth.confirmYourPassword')}
            />
            {validationErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{validationErrors.confirmPassword}</p>}
          </div>

          {/* (اختياري) حقول الاسم الأول والأخير */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('auth.firstName')}
              </label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 border-slate-300 dark:border-slate-600 focus:ring-sky-500/50 dark:focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder={t('auth.enterFirstName')}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('auth.lastName')}
              </label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 border-slate-300 dark:border-slate-600 focus:ring-sky-500/50 dark:focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder={t('auth.enterLastName')}
              />
            </div>
          </div>


          {/* زر الإرسال */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                       transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? t('auth.registering') : t('auth.registerButton')}
          </button>
        </form>

        {/* رابط لصفحة تسجيل الدخول */}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300">
            {t('auth.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;