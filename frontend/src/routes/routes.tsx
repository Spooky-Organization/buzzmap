import { RouteObject } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './guards';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { VerifyEmail } from '@/pages/auth/VerifyEmail';
import { ChangePassword } from '@/pages/auth/ChangePassword';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { Profile } from '@/pages/profile/Profile';
import { NotFound } from '@/pages/NotFound';
import { MFASetup } from '@/pages/mfa/MFASetup';
import { MFAVerify } from '@/pages/mfa/MFAVerify';
import { MFALogin } from '@/pages/mfa/MFALogin';
import { Users } from '@/pages/admin/Users';
import { UserDetails } from '@/pages/admin/UserDetails';
import { AnalyticsDashboard } from '@/pages/dashboard/AnalyticsDashboard';
import { TransactionsDashboard } from '@/pages/dashboard/TransactionsDashboard';
import { ReportsDashboard } from '@/pages/dashboard/ReportsDashboard';
import { TermsAndConditions } from '@/pages/legal/TermsAndConditions';
import { PrivacyPolicy } from '@/pages/legal/PrivacyPolicy';
import { ROUTES } from '@/utils/constants';

export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <Home />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LOGIN,
    element: <Login />,
  },
  {
    path: ROUTES.REGISTER,
    element: <Register />,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <ForgotPassword />,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <ResetPassword />,
  },
  {
    path: ROUTES.VERIFY_EMAIL,
    element: <VerifyEmail />,
  },
  {
    path: ROUTES.CHANGE_PASSWORD,
    element: (
      <ProtectedRoute>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.MFA_SETUP,
    element: (
      <ProtectedRoute>
        <MFASetup />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.MFA_VERIFY,
    element: <MFAVerify />,
  },
  {
    path: ROUTES.MFA_LOGIN,
    element: <MFALogin />,
  },
  {
    path: ROUTES.ADMIN_USERS,
    element: (
      <AdminRoute>
        <Users />
      </AdminRoute>
    ),
  },
  {
    path: '/admin/users/:id',
    element: (
      <AdminRoute>
        <UserDetails />
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.ANALYTICS,
    element: (
      <AdminRoute>
        <AnalyticsDashboard />
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.TRANSACTIONS,
    element: (
      <ProtectedRoute>
        <TransactionsDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.REPORTS,
    element: (
      <ProtectedRoute>
        <ReportsDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.TERMS,
    element: <TermsAndConditions />,
  },
  {
    path: ROUTES.PRIVACY,
    element: <PrivacyPolicy />,
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFound />,
  },
];

