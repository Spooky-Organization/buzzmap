import { SessionManager } from '@/auth/sessionManager';
import { UserDashboard } from './UserDashboard';
import { AccountantDashboard } from './AccountantDashboard';
import { AdminDashboard } from './AdminDashboard';

/**
 * Main Dashboard Component
 * Routes to role-specific dashboard based on user role
 */
export const Dashboard = () => {
  const sessionManager = SessionManager.getInstance();
  const sessionUser = sessionManager.getUser();
  
  const userRole = sessionUser?.role || 'USER';

  // Route to appropriate dashboard based on role
  switch (userRole) {
    case 'ACCOUNTANT':
      return <AccountantDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'USER':
    default:
      return <UserDashboard />;
  }
};

