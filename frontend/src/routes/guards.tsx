/**
 * Route Guards
 * Protect routes based on authentication and authorization
 */

import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { SessionManager } from '@/auth/sessionManager';
import { ROUTES } from '@/utils/constants';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'USER' | 'ACCOUNTANT' | 'ADMIN';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const sessionManager = SessionManager.getInstance();

  if (!sessionManager.isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRole && !sessionManager.hasRole(requiredRole)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  return <ProtectedRoute requiredRole="ADMIN">{children}</ProtectedRoute>;
};

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const sessionManager = SessionManager.getInstance();

  if (sessionManager.isAuthenticated()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
