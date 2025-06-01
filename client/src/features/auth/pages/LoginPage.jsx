// src/features/auth/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../config/axiosInstance';
import { useAuth } from '../../../contexts/AuthContext';
// import { useAuth } from '../../../hooks/useAuth'; // لاحقًا


const LoginPage = () => {
  const { login: contextLogin, isLoadingAuth } = useAuth();// <-- استخدام contextLogin 
  const { t } = useTranslation();
  const navigate = useNavigate();
  // const { login: contextLogin } = useAuth(); // لاحقًا

  const [formData, setFormData] = useState({
    login: '', // يمكن أن يكون email أو username
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', formData);
      
      console.log('Login successful:', response.data);
      const { user, token } = response.data.data; // افترض أن الرد بهذا الشكل

      contextLogin(user, token); // <-- تحديث حالة المصادقة عبر Context

      // --- الخطوات الهامة بعد تسجيل الدخول الناجح ---
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user)); // تخزين كائن المستخدم

      // لاحقًا، ستستدعي دالة من AuthContext هنا
      // contextLogin(user, token); 

      navigate('/dashboard'); // التوجيه إلى لوحة التحكم

    } catch (err) {
      console.error('Login error:', err);
      if (isLoadingAuth ) return <div>Checking authentication...</div>;
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(t('auth.loginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4'>
      <div className='w-full max-w-sm bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 sm:p-8'>
        <h2 className='text-2xl sm:text-3xl font-bold text-center text-slate-700 dark:text-slate-100 mb-6'>
          {t('auth.loginTitle')}
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className='mb-4'>
            <label htmlFor="login" className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
              {t('auth.email')} / {t('auth.username')} <span className='text-red-500'>*</span> 
            </label>
            <input 
              type="text" 
              id='login'
              name='login'
              value={formData.login}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 border-slate-300 dark:border-slate-600 focus:ring-sky-500/50 dark:focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder={t('auth.enterEmailOrUsername')}
              />
          </div>
          <div className='mb-6'>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('auth.password')} <span className='text-rose-500'>*</span>
            </label>
            <input 
              type="text" 
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 border-slate-300 dark:border-slate-600 focus:ring-sky-500/50 dark:focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder={t('auth.enterPassword')}
              />
          </div>
          <button
            type='submit'
            disabled={isLoading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                       transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
          </button>
        </form>
        <div className='mt-4 text-center'>
          <Link to="/forgot-password"  className="text-sm text-sky-600 hover:underline dark:text-sky-400">
            {t('auth.forgotPasswordLink')}
          </Link>
        </div>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300">
            {t('auth.registerLink')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;