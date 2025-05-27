// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../config/axiosInstance'; // لاستخدامه في تحديث الـ header لاحقًا

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [token, setToken] = useState(localStorage.getItem('authToken') || null);
const [isLoading, setIsLoading] = useState(true); // لتتبع التحميل الأولي لحالة المصادقة

// تأثير للتحقق من التوكن عند تحميل التطبيق لأول مرة
useEffect(() => {
    const currentToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (currentToken && storedUser) {
    try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(currentToken);
        // (اختياري ولكن جيد) قم بتعيين التوكن في axiosInstance headers هنا أيضًا
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
    } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }
    }
    setIsLoading(false); // انتهى التحميل الأولي
}, []);

const login = (userData, authToken) => {
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(authToken);
    // ✅  مهم: تحديث headers الافتراضية لـ axiosInstance فورًا
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
};

const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    // ✅  مهم: إزالة header المصادقة من axiosInstance
    delete axiosInstance.defaults.headers.common['Authorization'];
    // يمكنك أيضًا استدعاء API لتسجيل الخروج من الخادم إذا كان لديك (لإلغاء صلاحية التوكن من جانب الخادم)
    // navigate('/login'); // التوجيه يتم عادة من المكان الذي تم فيه استدعاء logout
};

// قيمة الـ context التي ستكون متاحة للمكونات الفرعية
const value = {
    user,
    token,
    isAuthenticated: !!token, // قيمة منطقية بسيطة لمعرفة ما إذا كان المستخدم مصادقًا عليه
    isLoadingAuth: isLoading, // لتجنب إعادة التوجيه قبل التحقق الأولي
    login,
    logout,
};

// لا تعرض شيئًا حتى ننتهي من التحميل الأولي لحالة المصادقة
// هذا يمنع وميض صفحة تسجيل الدخول إذا كان المستخدم مسجلاً دخوله بالفعل
if (isLoading) {
    return <div>Loading authentication state...</div>; // أو spinner
}

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// خطاف مخصص (Custom Hook) لاستخدام AuthContext بسهولة
export const useAuth = () => {
const context = useContext(AuthContext);
if (context === undefined || context === null) { // تعديل الشرط ليشمل null
    throw new Error('useAuth must be used within an AuthProvider');
}
return context;
};