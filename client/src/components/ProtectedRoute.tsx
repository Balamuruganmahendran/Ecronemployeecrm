import { useEffect } from "react";
import { useLocation } from "wouter";
import { getAuthData, isAdmin } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const auth = getAuthData();

  useEffect(() => {
    if (!auth) {
      setLocation("/login");
      return;
    }

    if (adminOnly && !isAdmin()) {
      setLocation("/employee/dashboard");
      return;
    }

    if (!adminOnly && isAdmin()) {
      setLocation("/admin/dashboard");
      return;
    }
  }, [adminOnly, setLocation, auth]);

  if (!auth) return null;
  if (adminOnly && !isAdmin()) return null;
  if (!adminOnly && isAdmin()) return null;

  return <>{children}</>;
}
