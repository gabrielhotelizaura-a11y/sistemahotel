import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingPage } from './LoadingSpinner';
import { UserRole } from '@/types/hotel';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/auth',
}: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingPage text="Verificando autenticação..." />;
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role if required
  if (requiredRole && userRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!requiredRoles.includes(userRole)) {
      return (
        <Navigate 
          to="/dashboard" 
          replace 
          state={{ 
            error: 'Você não tem permissão para acessar esta página.' 
          }} 
        />
      );
    }
  }

  return <>{children}</>;
}
