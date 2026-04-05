'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ClipboardList, Star, Users, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface BusinessDashboardData {
  orderCount: number;
  reviewCount: number;
  followerCount: number;
  recentPovs: Array<{
    id: string;
    title: string;
    viewCount: number;
    createdAt: string;
  }>;
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | null;
  icon: React.ElementType;
}) {
  return (
    <Card>
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
    </Card>
  );
}

export default function BusinessDashboardPage() {
  const { data: session } = useSession();

  const { data, isLoading } = useQuery<BusinessDashboardData>({
    queryKey: ['business-dashboard'],
    queryFn: async () => {
      const [ordersRes, statsRes, povsRes] = await Promise.all([
        api.get('/api/v1/orders/business', { params: { limit: 1 } }),
        api.get('/api/v1/recommendations/business/stats'),
        api.get('/api/v1/pov/business', { params: { limit: 5 } }),
      ]);
      return {
        orderCount: ordersRes.data.total ?? 0,
        reviewCount: statsRes.data.reviewCount ?? 0,
        followerCount: statsRes.data.followerCount ?? 0,
        recentPovs: povsRes.data.povs ?? [],
      };
    },
    enabled: !!session,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">Business Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business performance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={isLoading ? null : (data?.orderCount ?? 0)}
          icon={ClipboardList}
        />
        <StatCard
          title="Reviews"
          value={isLoading ? null : (data?.reviewCount ?? 0)}
          icon={Star}
        />
        <StatCard
          title="Followers"
          value={isLoading ? null : (data?.followerCount ?? 0)}
          icon={Users}
        />
        <StatCard
          title="POVs"
          value={isLoading ? null : (data?.recentPovs.length ?? 0)}
          icon={Video}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent POVs</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))
          ) : (data?.recentPovs.length ?? 0) === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No POVs yet</p>
          ) : (
            data?.recentPovs.map((pov) => (
              <div
                key={pov.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <p className="line-clamp-1 text-sm font-medium">{pov.title}</p>
                <span className="text-xs text-muted-foreground">
                  {pov.viewCount} views
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
