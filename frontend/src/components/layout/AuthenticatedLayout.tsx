import { Navigate, Outlet } from 'react-router-dom';
import { SessionManager } from '@/auth/sessionManager';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const AuthenticatedLayout = () => {
  const sessionManager = SessionManager.getInstance();

  if (!sessionManager.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <NotificationProvider>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </NotificationProvider>
  );
};
