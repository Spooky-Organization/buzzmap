'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Star, Users, BarChart3, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface AnalyticsStats {
  averageRating: number;
  recommendationPercent: number;
  reviewCount: number;
  followerCount: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  suffix,
}: {
  title: string;
  value: number | null;
  icon: React.ElementType;
  suffix?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="size-5 text-accent" />
        </div>
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-3xl font-bold text-primary">
            {typeof value === 'number' && !Number.isInteger(value)
              ? value.toFixed(1)
              : value}
            {suffix && (
              <span className="ml-1 text-base font-normal text-muted-foreground">
                {suffix}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data: session } = useSession();

  const { data, isLoading } = useQuery<AnalyticsStats>({
    queryKey: ['business-analytics'],
    queryFn: async () => {
      const res = await api.get('/api/v1/recommendations/business/stats');
      return {
        averageRating: res.data.averageRating ?? 0,
        recommendationPercent: res.data.recommendationPercent ?? 0,
        reviewCount: res.data.reviewCount ?? 0,
        followerCount: res.data.followerCount ?? 0,
      };
    },
    enabled: !!session,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">Analytics</h1>
        <p className="text-muted-foreground">Business performance at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Average Rating"
          value={isLoading ? null : (data?.averageRating ?? 0)}
          icon={Star}
          suffix="/ 5"
        />
        <StatCard
          title="Recommendation Rate"
          value={isLoading ? null : (data?.recommendationPercent ?? 0)}
          icon={Heart}
          suffix="%"
        />
        <StatCard
          title="Total Reviews"
          value={isLoading ? null : (data?.reviewCount ?? 0)}
          icon={BarChart3}
        />
        <StatCard
          title="Followers"
          value={isLoading ? null : (data?.followerCount ?? 0)}
          icon={Users}
        />
      </div>
    </div>
  );
}
