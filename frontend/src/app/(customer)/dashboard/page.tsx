'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ShoppingCart,
  ClipboardList,
  Bell,
  Video,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

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
    case 'CONFIRMED': return 'default';
    case 'PENDING': return 'secondary';
    case 'COMPLETED': return 'outline';
    case 'CANCELLED': return 'destructive';
    default: return 'secondary';
  }
}

export default function CustomerDashboardPage() {
  const { data: session } = useSession();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['customer-dashboard'],
    queryFn: async () => {
      const [povsRes, ordersRes, notifsRes] = await Promise.all([
        api.get('/api/v1/pov/my', { params: { limit: 5 } }),
        api.get('/api/v1/orders/my', { params: { limit: 5, status: 'PENDING,CONFIRMED' } }),
        api.get('/api/v1/notifications', { params: { limit: 1 } }),
      ]);
      return {
        recentPovs: povsRes.data.povs ?? [],
        activeOrders: ordersRes.data.orders ?? [],
        unreadNotifications: notifsRes.data.unreadCount ?? 0,
      };
    },
    enabled: !!session,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">
          Welcome back, {session?.user?.name?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Active Orders"
          value={isLoading ? null : (data?.activeOrders.length ?? 0)}
          icon={ClipboardList}
          href="/orders"
        />
        <StatCard
          title="Notifications"
          value={isLoading ? null : (data?.unreadNotifications ?? 0)}
          icon={Bell}
          href="/notifications"
        />
        <StatCard
          title="My POVs"
          value={isLoading ? null : (data?.recentPovs.length ?? 0)}
          icon={Video}
          href="/pov"
        />
        <StatCard
          title="Cart Items"
          value={0}
          icon={ShoppingCart}
          href="/cart"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Orders</CardTitle>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/orders" />}>
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : (data?.activeOrders.length ?? 0) === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No active orders
              </p>
            ) : (
              data?.activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium">{order.businessName}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={orderStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                    <span className="text-xs font-medium">
                      ₱{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent POVs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent POVs</CardTitle>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/pov" />}>
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : (data?.recentPovs.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <p className="text-sm text-muted-foreground">No POVs yet</p>
                <Button size="sm" nativeButton={false} render={<Link href="/pov/create" />}>
                  Create your first POV
                </Button>
              </div>
            ) : (
              data?.recentPovs.map((pov) => (
                <div
                  key={pov.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <p className="line-clamp-1 text-sm font-medium">{pov.title}</p>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="size-3" />
                    {pov.viewCount}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: number | null;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Card className="transition-colors hover:ring-accent">
      <Link href={href}>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">{title}</p>
              {value === null ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p className="text-2xl font-bold text-primary">{value}</p>
              )}
            </div>
            <Icon className="size-8 text-accent" />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
