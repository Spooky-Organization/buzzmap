'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Bell,
  ClipboardList,
  Clock,
  Compass,
  Package2,
  ShoppingCart,
  TrendingUp,
  Video,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomerDashboardLoading } from '@/components/dashboard/loading-skeletons';
import {
  DashboardHero,
  DashboardHeroPill,
  DashboardMetricCard,
  DashboardPanel,
} from '@/components/dashboard/dashboard-surfaces';
import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';

interface DashboardData {
  recentPovs: Array<{
    id: string;
    title: string;
    viewCount: number;
    createdAt: string;
  }>;
  activeOrders: Array<{
    id: string;
    status: string;
    total: number;
    createdAt: string;
    businessName: string;
  }>;
  unreadNotifications: number;
}

function orderStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'CONFIRMED':
      return 'default';
    case 'PENDING':
      return 'secondary';
    case 'COMPLETED':
      return 'outline';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default function CustomerDashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['customer-dashboard'],
    queryFn: async () => {
      const [povsRes, ordersRes, notifsRes] = await Promise.all([
        api.get(apiRoutes.pov.mine, { params: { limit: 5 } }),
        api.get(apiRoutes.orders.mine, { params: { limit: 5, status: 'PENDING,CONFIRMED' } }),
        api.get(apiRoutes.notifications.root, { params: { limit: 1 } }),
      ]);
      return {
        recentPovs: povsRes.data.povs ?? [],
        activeOrders: ordersRes.data.orders ?? [],
        unreadNotifications: notifsRes.data.unreadCount ?? 0,
      };
    },
    enabled: !!session,
  });

  if (isLoading) {
    return <CustomerDashboardLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Customer dashboard"
        title={`Welcome back, ${firstName}`}
        icon={Compass}
      >
        <DashboardHeroPill
          icon={ClipboardList}
          label="Open orders"
          value={`${data?.activeOrders.length ?? 0} in motion`}
          note="Pending and confirmed purchases that still need attention."
        />
        <DashboardHeroPill
          icon={Bell}
          label="Unread alerts"
          value={`${data?.unreadNotifications ?? 0} notifications`}
          note="Fresh platform, order, and conversation updates for this account."
        />
        <DashboardHeroPill
          icon={Video}
          label="POV cadence"
          value={`${data?.recentPovs.length ?? 0} recent posts`}
          note="Your latest review activity that can keep businesses discoverable."
        />
      </DashboardHero>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard
          label="Active Orders"
          value={String(data?.activeOrders.length ?? 0)}
          note="Go to orders and track fulfillment."
          icon={ClipboardList}
          accent="from-sky-500/15 via-primary/[0.08] to-transparent"
          href={appRoutes.customer.orders}
        />
        <DashboardMetricCard
          label="Notifications"
          value={String(data?.unreadNotifications ?? 0)}
          note="Check unread updates and keep the session clean."
          icon={Bell}
          accent="from-rose-500/15 via-primary/[0.08] to-transparent"
          href={appRoutes.customer.notifications}
        />
        <DashboardMetricCard
          label="Recent POVs"
          value={String(data?.recentPovs.length ?? 0)}
          note="Create a new POV or review past activity."
          icon={Video}
          accent="from-amber-500/18 via-primary/[0.08] to-transparent"
          href={appRoutes.customer.povCreate}
        />
        <DashboardMetricCard
          label="Cart"
          value="Open"
          note="Jump back into checkout-ready items."
          icon={ShoppingCart}
          accent="from-emerald-500/15 via-primary/[0.08] to-transparent"
          href={appRoutes.customer.cart}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.95fr]">
        <DashboardPanel
          title="Active Orders"
          icon={Package2}
          actionLabel="View orders"
          actionHref={appRoutes.customer.orders}
        >
          {(data?.activeOrders.length ?? 0) === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-background/85 px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">No active orders right now.</p>
              <Button className="mt-4" size="sm" nativeButton={false} render={<Link href={appRoutes.customer.feed} />}>
                Browse the feed
              </Button>
            </div>
          ) : (
            data?.activeOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-border/70 bg-background/90 px-4 py-4 transition-colors hover:border-primary/20 hover:bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{order.businessName}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
                    <span className="text-sm font-semibold text-primary">KES {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Recent POVs"
          icon={TrendingUp}
          actionLabel="Create POV"
          actionHref={appRoutes.customer.povCreate}
        >
          {(data?.recentPovs.length ?? 0) === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-background/85 px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">No POVs yet.</p>
              <Button className="mt-4" size="sm" nativeButton={false} render={<Link href={appRoutes.customer.povCreate} />}>
                Publish your first POV
              </Button>
            </div>
          ) : (
            data?.recentPovs.map((pov) => (
              <div
                key={pov.id}
                className="flex items-center justify-between gap-3 rounded-3xl border border-border/70 bg-background/90 px-4 py-4 transition-colors hover:border-primary/20 hover:bg-card"
              >
                <div className="space-y-1">
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">{pov.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(pov.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="size-3.5 text-primary" />
                  {pov.viewCount} views
                </span>
              </div>
            ))
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}
