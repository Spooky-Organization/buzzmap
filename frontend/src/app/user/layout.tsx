'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { BusinessSidebar } from '@/components/business/business-sidebar';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { DashboardLayoutShell } from '@/components/shared/dashboard-layout-shell';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { appRoutes } from '@/lib/routes';

function resolveSidebar(role?: string) {
  if (role === 'ADMIN') return <AdminSidebar />;
  if (role === 'BUSINESS_OWNER') return <BusinessSidebar />;
  return <AppSidebar />;
}

export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace(appRoutes.auth.login);
    }
  }, [router, status]);

  if (status === 'loading') {
    return (
      <LoadingScreen
        title="Opening Profile Workspace"
        message="We are loading the right BuzzMap shell for this profile view."
      />
    );
  }

  if (status !== 'authenticated') {
    return null;
  }

  return <DashboardLayoutShell sidebar={resolveSidebar(session?.user.role)}>{children}</DashboardLayoutShell>;
}
