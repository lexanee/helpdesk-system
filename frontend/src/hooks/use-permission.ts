import { useCallback } from "react";

import { useAuth } from "./use-auth";

export const usePermission = () => {
  const { data: user } = useAuth();

  const hasPermission = useCallback(
    (requiredPermissions?: string | string[]) => {
      if (!requiredPermissions) return true;
      if (!user) return false;

      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      if (permissions.length === 0) return true;

      // Ensure permissions exist
      if (!user.permissions) return false;

      return permissions.some((required) => {
        // Exact match
        if (user.permissions.includes(required)) return true;

        return false;
      });
    },
    [user],
  );

  const hasRole = useCallback(
    (requiredRoles?: string | string[]) => {
      if (!requiredRoles) return true;
      if (!user) return false;

      const roles = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      if (roles.length === 0) return true;

      return roles.includes(user.role);
    },
    [user],
  );

  return { hasPermission, hasRole, user };
};
