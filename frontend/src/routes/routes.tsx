import { lazy, Suspense, LazyExoticComponent } from 'react';
import { RouteObject } from 'react-router-dom';
import { AdminRoute } from './guards';
import { Home } from '@/pages/Home';
import { ROUTES } from '@/utils/constants';
import { PageLoader } from '@/components/PageLoader';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withSuspense = (LazyComponent: LazyExoticComponent<any>) => {
  return (
    <Suspense fallback={<PageLoader />}>
      <LazyComponent />
    </Suspense>
  );
};

export const routes: RouteObject[] = [
  // Public routes
  {
    path: ROUTES.HOME,
    element: <Home />,
  },
  {
    path: ROUTES.LOGIN,
    element: withSuspense(lazy(() => import('@/pages/auth/Login').then(m => ({ default: m.Login })))),
  },
  {
    path: ROUTES.REGISTER,
    element: withSuspense(lazy(() => import('@/pages/auth/Register').then(m => ({ default: m.Register })))),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: withSuspense(lazy(() => import('@/pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })))),
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: withSuspense(lazy(() => import('@/pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })))),
  },
  {
    path: ROUTES.VERIFY_EMAIL,
    element: withSuspense(lazy(() => import('@/pages/auth/VerifyEmail').then(m => ({ default: m.VerifyEmail })))),
  },
  {
    path: ROUTES.MFA_VERIFY,
    element: withSuspense(lazy(() => import('@/pages/mfa/MFAVerify').then(m => ({ default: m.MFAVerify })))),
  },
  {
    path: ROUTES.MFA_LOGIN,
    element: withSuspense(lazy(() => import('@/pages/mfa/MFALogin').then(m => ({ default: m.MFALogin })))),
  },
  {
    path: ROUTES.TERMS,
    element: withSuspense(lazy(() => import('@/pages/legal/TermsAndConditions').then(m => ({ default: m.TermsAndConditions })))),
  },
  {
    path: ROUTES.PRIVACY,
    element: withSuspense(lazy(() => import('@/pages/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })))),
  },
  {
    path: ROUTES.NOT_FOUND,
    element: withSuspense(lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })))),
  },

  // Protected routes — auth check handled by AuthenticatedLayout
  {
    element: <AuthenticatedLayout />,
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: withSuspense(lazy(() => import('@/pages/dashboard/Dashboard').then(m => ({ default: m.Dashboard })))),
      },
      {
        path: ROUTES.CHANGE_PASSWORD,
        element: withSuspense(lazy(() => import('@/pages/auth/ChangePassword').then(m => ({ default: m.ChangePassword })))),
      },
      {
        path: ROUTES.PROFILE,
        element: withSuspense(lazy(() => import('@/pages/profile/Profile').then(m => ({ default: m.Profile })))),
      },
      {
        path: ROUTES.MFA_SETUP,
        element: withSuspense(lazy(() => import('@/pages/mfa/MFASetup').then(m => ({ default: m.MFASetup })))),
      },
      {
        path: ROUTES.ADMIN_USERS,
        element: (
          <AdminRoute>
            {withSuspense(lazy(() => import('@/pages/admin/Users').then(m => ({ default: m.Users }))))}
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_USER_DETAILS,
        element: (
          <AdminRoute>
            {withSuspense(lazy(() => import('@/pages/admin/UserDetails').then(m => ({ default: m.UserDetails }))))}
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.ANALYTICS,
        element: (
          <AdminRoute>
            {withSuspense(lazy(() => import('@/pages/dashboard/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard }))))}
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.TRANSACTIONS,
        element: withSuspense(lazy(() => import('@/pages/dashboard/TransactionsDashboard').then(m => ({ default: m.TransactionsDashboard })))),
      },
      {
        path: ROUTES.REPORTS,
        element: withSuspense(lazy(() => import('@/pages/dashboard/ReportsDashboard').then(m => ({ default: m.ReportsDashboard })))),
      },
    ],
  },
];
