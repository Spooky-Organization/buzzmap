'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { appRoutes } from '@/lib/routes';
import { DashboardLayoutShell } from '@/components/shared/dashboard-layout-shell';
import { BusinessSidebar } from '@/components/business/business-sidebar';
import { AppSidebar } from '@/components/shared/app-sidebar';

const BUSINESS_WORKSPACE_SEGMENTS = new Set([
  'analytics',
  'dashboard',
  'messages',
  'notifications',
  'orders',
  'posts',
  'settings',
  'shelf',
]);

function resolveSidebar(role?: string) {
  if (role === 'ADMIN') return <AdminSidebar />;
  if (role === 'BUSINESS_OWNER') return <BusinessSidebar />;
  return <AppSidebar />;
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const publicProfileCandidate = pathname.match(/^\/business\/([^/]+)$/)?.[1] ?? null;
  const isPublicBusinessProfile =
    publicProfileCandidate !== null && !BUSINESS_WORKSPACE_SEGMENTS.has(publicProfileCandidate);

  useEffect(() => {
    if (isPublicBusinessProfile) {
      return;
    }

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace(appRoutes.auth.login);
      return;
    }

    if (session?.user.role !== 'BUSINESS_OWNER') {
      router.replace(appRoutes.customer.dashboard);
    }
  }, [isPublicBusinessProfile, router, session?.user.role, status]);

  if (isPublicBusinessProfile) {
    if (status === 'authenticated') {
      return (
        <DashboardLayoutShell sidebar={resolveSidebar(session?.user.role)}>
          {children}
        </DashboardLayoutShell>
      );
    }

    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <LoadingScreen
        title="Opening Business Portal"
        message="We are verifying your account and loading your management workspace."
      />
    );
  }

  if (status !== 'authenticated' || session?.user.role !== 'BUSINESS_OWNER') {
    return null;
  }

  return (
    <DashboardLayoutShell sidebar={<BusinessSidebar />}>{children}</DashboardLayoutShell>
  );
}
