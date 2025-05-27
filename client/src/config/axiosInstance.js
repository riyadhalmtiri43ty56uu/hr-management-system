// src/config/axiosInstance.js
import axios from 'axios';

// جلب عنوان URL الأساسي لواجهة برمجة التطبيقات من متغيرات البيئة
// Vite يعرض متغيرات البيئة التي تبدأ بـ VITE_ إلى كود العميل عبر import.meta.env
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'; // قيمة احتياطية

// إنشاء instance مخصص لـ Axios
const axiosInstance = axios.create({
  baseURL: baseURL,
  // يمكنك تعيين مهلة افتراضية للطلبات (بالمللي ثانية)
  // timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // يمكنك إضافة headers ثابتة أخرى هنا إذا لزم الأمر
  },
});

// --- Interceptor لإضافة توكن المصادقة إلى الطلبات ---
// يتم تنفيذ هذا الكود قبل إرسال كل طلب باستخدام هذا الـ instance
axiosInstance.interceptors.request.use(
  (config) => {
    // الحصول على توكن المصادقة (مثلاً من localStorage)
    // لاحقًا، يمكنك الحصول عليه من AuthContext
    const token = localStorage.getItem('authToken'); // استخدم اسم المفتاح الصحيح الذي ستخزن به التوكن

    // إذا كان التوكن موجودًا، قم بإضافته إلى header الـ Authorization
    if (token) {
      // تأكد من استخدام الصيغة الصحيحة (Bearer, Token, ...) حسب طريقة مصادقة الخادم
      config.headers['Authorization'] = `Bearer ${token}`; // يضيفه إلى header
    }

    // إعادة كائن الإعدادات المعدل
    return config;
  },
  (error) => {
    // التعامل مع أخطاء إعداد الطلب
    console.error("Axios request interceptor error:", error);
    return Promise.reject(error);
  }
);

// --- (اختياري) Interceptor لمعالجة الردود ---
// يتم تنفيذ هذا الكود بعد استلام الرد وقبل أن يتم تمريره إلى دالة .then() أو .catch()
axiosInstance.interceptors.response.use(
  (response) => {
    // أي معالجة ناجحة للرد يمكن أن تتم هنا
    // (مثلاً، استخراج البيانات مباشرة: return response.data;)
    return response;
  },
  (error) => {
    // التعامل مع أخطاء الرد (مثل 401 Unauthorized, 403 Forbidden, 500 Internal Server Error)
    console.error("Axios response interceptor error:", error.response || error.message);

    if (error.response) {
      // الخادم رد بخطأ (خارج نطاق 2xx)
      if (error.response.status === 401) {
        // خطأ غير مصادق عليه (Unauthorized)
        console.warn("Unauthorized request - logging out or refreshing token...");
        // هنا يمكنك تنفيذ منطق تسجيل الخروج أو محاولة تحديث التوكن
        // مثال:
        // localStorage.removeItem('authToken');
        // localStorage.removeItem('user');
        // window.location.href = '/login'; // إعادة توجيه بسيطة (يفضل استخدام navigate من react-router-dom)
      } else if (error.response.status === 403) {
        // خطأ ممنوع (Forbidden) - المستخدم مصادق عليه ولكن ليس لديه صلاحية
        console.warn("Forbidden request - user lacks permission.");
        // يمكنك عرض رسالة للمستخدم
      }
      // يمكنك إضافة معالجة لحالات خطأ أخرى (404, 500, ...)
    } else if (error.request) {
      // تم إرسال الطلب ولكن لم يتم استلام رد (مشكلة في الشبكة؟)
      console.error("Network error or no response received:", error.request);
    } else {
      // خطأ حدث أثناء إعداد الطلب أدى إلى إطلاق الخطأ
      console.error("Error setting up request:", error.message);
    }

    // إعادة الخطأ ليتم التعامل معه في المكان الذي تم فيه استدعاء الطلب (في .catch())
    return Promise.reject(error);
  }
);

// تصدير الـ instance المهيأ لاستخدامه في خدمات API
export default axiosInstance;