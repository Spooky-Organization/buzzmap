'use client';

import Link from 'next/link';
import { Lock, Settings, Store, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DashboardHero,
  DashboardHeroPill,
  DashboardPanel,
} from '@/components/dashboard/dashboard-surfaces';
import { appRoutes } from '@/lib/routes';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Premium analytics"
        title="Analytics is gated out of the standard business workspace."
        description="The normal business flow stays focused on orders, shelf quality, posts, and trust-building profile work. This route remains as a premium placeholder instead of a default navigation destination."
        icon={Lock}
      >
        <DashboardHeroPill
          icon={Store}
          label="Keep live"
          value="Orders & shelf"
          note="The standard workspace still covers operational storefront tasks."
        />
        <DashboardHeroPill
          icon={Video}
          label="Trust surface"
          value="POVs first"
          note="Customer POVs and profile quality still shape the public-facing business experience."
        />
        <DashboardHeroPill
          icon={Settings}
          label="Use instead"
          value="Profile tuning"
          note="Keep the business page complete and the shelf accurate while analytics stays gated."
        />
      </DashboardHero>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardPanel
          title="Why this is gated"
          description="Analytics is treated as a premium feature rather than a default operating surface."
          icon={Lock}
        >
          <div className="rounded-3xl border border-border/70 bg-background/90 px-4 py-4">
            <p className="text-sm font-semibold text-foreground">Standard business flow stays uncluttered</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              Orders, shelf management, posts, and business settings remain the default path.
              The analytics route stays accessible only as a gated placeholder instead of a normal menu item.
            </p>
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Use instead"
          description="The business surfaces that still matter in the non-premium flow."
          icon={Settings}
        >
          <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-background/90 px-4 py-4">
            <Button nativeButton={false} render={<Link href={appRoutes.business.settings} />}>
              <Settings data-icon="inline-start" />
              Open business settings
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href={appRoutes.business.dashboard} />}>
              <Store data-icon="inline-start" />
              Return to dashboard
            </Button>
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
