import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = "/auth" 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate(redirectTo, { state: { from: location.pathname }, replace: true });
      return;
    }

    // Check if user has permission for this route
    if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
      // Redirect to their appropriate dashboard
      navigate(getDashboardPath(), { replace: true });
      return;
    }
  }, [isAuthenticated, isLoading, role, allowedRoles, navigate, location.pathname, redirectTo, getDashboardPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
