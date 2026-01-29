import type { ReactNode } from "react";

import { usePermission } from "@/hooks/use-permission";

interface AccessGuardProps {
  permissions?: string | string[];
  roles?: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const AccessGuard = ({
  permissions,
  roles,
  children,
  fallback = null,
}: AccessGuardProps) => {
  const { hasPermission, hasRole } = usePermission();

  const isAuthorized =
    (!permissions || hasPermission(permissions)) && (!roles || hasRole(roles));

  if (isAuthorized) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
