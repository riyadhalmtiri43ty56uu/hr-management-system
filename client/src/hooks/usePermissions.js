// src/hooks/usePermissions.js
import { useAuth } from "../contexts/AuthContext";

export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (roleOrRoles) => {
    if (!user || !user.roles || user.roles.length === 0) {
      return false;
    }
    if (Array.isArray(roleOrRoles)) {
      return roleOrRoles.some((role) => user.roles.includes(role));
    }
    return user.roles.includes(roleOrRoles);
  };

  // يمكنك إضافة دالة hasPermission(permissionName) إذا كان لديك نظام صلاحيات دقيق
  // const hasPermission = (permission) => { ... };

  return { hasRole /*, hasPermission */ };
};
