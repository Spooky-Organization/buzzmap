'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Activity, BarChart3, Eye, Heart, Star, TrendingUp, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';
import { AnalyticsDashboardLoading } from '@/components/dashboard/loading-skeletons';
import {
  DashboardHero,
  DashboardHeroPill,
  DashboardMetricCard,
  DashboardPanel,
} from '@/components/dashboard/dashboard-surfaces';

interface AnalyticsStats {
  avgRating: number;
  recommendationPercentage: number;
  reviewCount: number;
  followerCount: number;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();

  const { data, isLoading } = useQuery<AnalyticsStats>({
    queryKey: ['business-analytics'],
    queryFn: async () => {
      const res = await api.get(apiRoutes.recommendations.businessStats);
      return {
        avgRating: res.data.avgRating ?? 0,
        recommendationPercentage: res.data.recommendationPercentage ?? 0,
        reviewCount: res.data.reviewCount ?? 0,
        followerCount: res.data.followerCount ?? 0,
      };
    },
    enabled: !!session,
  });

  if (isLoading) {
    return <AnalyticsDashboardLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Business analytics"
        title="Measure the signals that shape business trust."
        description="These analytics summarize how customers are responding to the business profile, how strongly they recommend it, and how broad the business audience has become."
        icon={Activity}
      >
        <DashboardHeroPill
          icon={Star}
          label="Rating signal"
          value={`${(data?.avgRating ?? 0).toFixed(1)} / 5`}
          note="The current average customer rating derived from submitted reviews."
        />
        <DashboardHeroPill
          icon={Heart}
          label="Recommendation"
          value={`${Math.round(data?.recommendationPercentage ?? 0)}%`}
          note="How often customers recommend the business after sharing a POV."
        />
        <DashboardHeroPill
          icon={Eye}
          label="Audience"
          value={`${data?.followerCount ?? 0} followers`}
          note="Users who have chosen to keep tracking this business."
        />
      </DashboardHero>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          label="Average Rating"
          value={`${(data?.avgRating ?? 0).toFixed(1)}`}
          note="Overall rating quality across customer reviews."
          icon={Star}
          accent="from-amber-500/18 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Recommendation"
          value={`${Math.round(data?.recommendationPercentage ?? 0)}%`}
          note="Customers recommending the business after experience."
          icon={Heart}
          accent="from-rose-500/15 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Reviews"
          value={String(data?.reviewCount ?? 0)}
          note="The total number of submitted review records."
          icon={BarChart3}
          accent="from-sky-500/15 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Followers"
          value={String(data?.followerCount ?? 0)}
          note="Users following future business activity and updates."
          icon={Users}
          accent="from-emerald-500/15 via-primary/[0.08] to-transparent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardPanel
          title="Performance Read"
          description="A quick interpretation of the current analytics surface."
          icon={TrendingUp}
        >
          <div className="rounded-3xl border border-border/70 bg-background/90 px-4 py-4">
            <p className="text-sm font-semibold text-foreground">Customer sentiment</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              Ratings, recommendation rate, and follow growth work together. Keep the business
              description, photos, and shelf current so these signals compound instead of stalling.
            </p>
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Operator Note"
          description="What to focus on next if you want better analytics."
          icon={Activity}
        >
          <div className="rounded-3xl border border-border/70 bg-background/90 px-4 py-4">
            <p className="text-sm font-semibold text-foreground">Improve review velocity</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              Encourage authentic customer POV creation, maintain pricing accuracy, and keep the
              public profile complete so more visitors can convert into reviewers and followers.
            </p>
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
