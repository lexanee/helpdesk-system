import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";

interface GuestGuardProps {
  children: ReactNode;
}

export const GuestGuard = ({ children }: GuestGuardProps) => {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};
