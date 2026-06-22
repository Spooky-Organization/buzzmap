'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  MessageSquareHeart,
  PackageSearch,
  Star,
  Store,
  Users,
  Video,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BusinessDashboardLoading } from '@/components/dashboard/loading-skeletons';
import {
  DashboardHero,
  DashboardHeroPill,
  DashboardMetricCard,
  DashboardPanel,
} from '@/components/dashboard/dashboard-surfaces';
import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';

interface BusinessDashboardData {
  orderCount: number;
  reviewCount: number;
  followerCount: number;
  recentPovs: Array<{
    id: string;
    caption: string | null;
    starRating: number | null;
    createdAt: string;
  }>;
}

interface BusinessProfileSummary {
  id: string;
}

export default function BusinessDashboardPage() {
  const { data: session } = useSession();
  const isBusinessOwner = session?.user.role === 'BUSINESS_OWNER';
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Owner';

  const { data, isLoading } = useQuery<BusinessDashboardData>({
    queryKey: ['business-dashboard'],
    queryFn: async () => {
      const profileRes = await api.get(apiRoutes.business.profile);
      const profile = profileRes.data as BusinessProfileSummary;

      const [ordersRes, statsRes, povsRes] = await Promise.all([
        api.get(apiRoutes.orders.business, { params: { limit: 1 } }),
        api.get(apiRoutes.recommendations.businessStats),
        api.get(apiRoutes.pov.byBusiness(profile.id), { params: { limit: 5 } }),
      ]);

      return {
        orderCount: ordersRes.data.total ?? 0,
        reviewCount: statsRes.data.reviewCount ?? 0,
        followerCount: statsRes.data.followerCount ?? 0,
        recentPovs: povsRes.data.data ?? [],
      };
    },
    enabled: isBusinessOwner,
  });

  if (isLoading) {
    return <BusinessDashboardLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Business operations"
        title={`Run the storefront with confidence, ${firstName}`}
        description="Watch order flow, review momentum, follower growth, and fresh POV feedback from one operating surface built for business owners."
        icon={LayoutDashboard}
      >
        <DashboardHeroPill
          icon={ClipboardList}
          label="Order queue"
          value={`${data?.orderCount ?? 0} orders`}
          note="Track current order volume and move quickly into fulfillment."
        />
        <DashboardHeroPill
          icon={MessageSquareHeart}
          label="Trust signals"
          value={`${data?.reviewCount ?? 0} reviews`}
          note="POV-backed reviews that shape buyer confidence and business ranking."
        />
        <DashboardHeroPill
          icon={Users}
          label="Audience"
          value={`${data?.followerCount ?? 0} followers`}
          note="People who have opted into your business updates and profile activity."
        />
      </DashboardHero>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard
          label="Orders"
          value={String(data?.orderCount ?? 0)}
          note="Inspect demand and order handling."
          icon={ClipboardList}
          accent="from-sky-500/15 via-primary/[0.08] to-transparent"
          href={appRoutes.business.orders}
        />
        <DashboardMetricCard
          label="Reviews"
          value={String(data?.reviewCount ?? 0)}
          note="Stay close to new public trust signals."
          icon={Star}
          accent="from-amber-500/18 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Followers"
          value={String(data?.followerCount ?? 0)}
          note="Audience growth connected to business visibility."
          icon={Users}
          accent="from-emerald-500/15 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Recent POVs"
          value={String(data?.recentPovs.length ?? 0)}
          note="See the latest customer review activity."
          icon={Video}
          accent="from-rose-500/15 via-primary/[0.08] to-transparent"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
        <DashboardPanel
          title="Recent POVs"
          description="Customer reviews and fresh business mentions that define how your storefront feels in public."
          icon={Video}
          actionLabel="Open settings"
          actionHref={appRoutes.business.settings}
        >
          {(data?.recentPovs.length ?? 0) === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-background/85 px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">No POVs have been attached to this business yet.</p>
              <Button className="mt-4" size="sm" nativeButton={false} render={<Link href={appRoutes.business.settings} />}>
                Complete business profile
              </Button>
            </div>
          ) : (
            data?.recentPovs.map((pov) => (
              <div
                key={pov.id}
                className="rounded-3xl border border-border/70 bg-background/90 px-4 py-4 transition-colors hover:border-primary/20 hover:bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="line-clamp-1 text-sm font-semibold text-foreground">
                      {pov.caption?.trim() || 'Untitled POV review'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(pov.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {pov.starRating !== null ? (
                    <Badge variant="outline">{pov.starRating}/5</Badge>
                  ) : (
                    <Badge variant="outline">Experience</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </DashboardPanel>

        <div className="grid gap-6">
          <DashboardPanel
            title="Quick Access"
            description="The highest-frequency business actions wired into your operating lane."
            icon={PackageSearch}
          >
            <div className="grid gap-3">
              <QuickLinkCard
                href={appRoutes.business.shelf}
                icon={Store}
                title="Product Shelf"
                description="Update storefront inventory, pricing, and presentation."
              />
              <QuickLinkCard
                href={appRoutes.business.postsCreate}
                icon={Megaphone}
                title="Create Post"
                description="Publish business updates that appear on the public profile."
              />
              <QuickLinkCard
                href={appRoutes.business.orders}
                icon={ClipboardList}
                title="Order Management"
                description="Stay on top of new purchases, fulfillment, and status updates."
              />
              <QuickLinkCard
                href={appRoutes.business.settings}
                icon={MessageSquareHeart}
                title="Trust & Profile"
                description="Tune profile details and keep the public trust surface consistent."
              />
            </div>
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-3xl border border-border/70 bg-background/90 px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
          <Icon className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}

