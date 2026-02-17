import { useAuth } from './useAuth';

export const useRolePermissions = () => {
  const { user } = useAuth();

  const isPatient = () => user?.role === 'patient';
  const isDoctor = () => user?.role === 'doctor';
  const isAdmin = () => user?.role === 'admin';

  const hasRole = (roles) => {
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    return roles.includes(user?.role);
  };

  const canAccess = (requiredRole) => {
    if (requiredRole === 'any') return true;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user?.role);
    }
    return user?.role === requiredRole;
  };

  return {
    isPatient,
    isDoctor,
    isAdmin,
    hasRole,
    canAccess,
    role: user?.role,
  };
};
