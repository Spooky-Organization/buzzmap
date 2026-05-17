'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { DashboardLayoutShell } from '@/components/shared/dashboard-layout-shell';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { appRoutes } from '@/lib/routes';

export function CustomerLayoutShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace(appRoutes.auth.login);
      return;
    }

    if (session?.user.role === 'ADMIN') {
      router.replace(appRoutes.admin.overview);
      return;
    }

    if (session?.user.role === 'BUSINESS_OWNER') {
      router.replace(appRoutes.business.dashboard);
    }
  }, [router, session?.user.role, status]);

  if (status === 'loading') {
    return (
      <LoadingScreen
        title="Opening Dashboard"
        message="We are verifying your account and preparing the right BuzzMap workspace."
      />
    );
  }

  if (status !== 'authenticated' || session?.user.role !== 'CUSTOMER') {
    return null;
  }

  return <DashboardLayoutShell sidebar={<AppSidebar />}>{children}</DashboardLayoutShell>;
}
