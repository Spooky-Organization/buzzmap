'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { DashboardLayoutShell } from '@/components/shared/dashboard-layout-shell';
import { appRoutes } from '@/lib/routes';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace(appRoutes.auth.login);
      return;
    }

    if (session?.user.role !== 'ADMIN') {
      router.replace(appRoutes.customer.dashboard);
    }
  }, [router, session?.user.role, status]);

  if (status === 'loading') {
    return (
      <LoadingScreen
        title="Opening Admin Console"
        message="We are verifying elevated access and preparing the BuzzMap control plane."
      />
    );
  }

  if (status !== 'authenticated' || session?.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <DashboardLayoutShell sidebar={<AdminSidebar />}>{children}</DashboardLayoutShell>
  );
}
