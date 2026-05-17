'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  BellRing,
  Boxes,
  Building2,
  ClipboardList,
  Eye,
  Flame,
  Megaphone,
  MessageSquareWarning,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AdminPageShell } from '@/components/admin/admin-page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';

const coreAreas = [
  {
    title: 'Users',
    description: 'Manage customers, business owners, admins, and account states.',
    href: appRoutes.admin.users,
    icon: Users,
  },
  {
    title: 'Businesses',
    description: 'Handle verification, quality checks, and marketplace supply health.',
    href: appRoutes.admin.businesses,
    icon: Building2,
  },
  {
    title: 'Catalog',
    description: 'Oversee listings, outliers, and category quality across the platform.',
    href: appRoutes.admin.catalog,
    icon: Boxes,
  },
  {
    title: 'Orders',
    description: 'Inspect global order flow, stuck states, and support-sensitive cases.',
    href: appRoutes.admin.orders,
    icon: ClipboardList,
  },
  {
    title: 'Moderation',
    description: 'Review POVs, comments, posts, and report queues.',
    href: appRoutes.admin.moderation,
    icon: ShieldCheck,
  },
  {
    title: 'Messages',
    description: 'Track flagged or escalated conversations and intervention points.',
    href: appRoutes.admin.messages,
    icon: MessageSquareWarning,
  },
  {
    title: 'Announcements',
    description: 'Manage platform notices, campaigns, and broadcast communication.',
    href: appRoutes.admin.announcements,
    icon: Megaphone,
  },
  {
    title: 'Security',
    description: 'Watch auth anomalies, rate limits, uploads, and suspicious activity.',
    href: appRoutes.admin.security,
    icon: ShieldCheck,
  },
  {
    title: 'System',
    description: 'Monitor application, queue, storage, and runtime health.',
    href: appRoutes.admin.system,
    icon: Activity,
  },
  {
    title: 'Settings',
    description: 'Govern feature flags, policy rules, and platform configuration.',
    href: appRoutes.admin.settings,
    icon: BellRing,
  },
];

const quickActions = [
  'Review pending business verification',
  'Inspect flagged POV and comment queue',
  'Check suspicious auth or refresh-token failures',
  'Broadcast a system-wide maintenance announcement',
];

const watchTowers = [
  {
    title: 'Identity',
    description: 'Sessions, refresh health, and privileged account activity.',
    icon: ShieldAlert,
  },
  {
    title: 'Marketplace',
    description: 'Supply quality, business visibility, and product coverage.',
    icon: Building2,
  },
  {
    title: 'Engagement',
    description: 'Messages, alerts, and community trust signals.',
    icon: Sparkles,
  },
];

interface TopBusinessResult {
  businessId: string;
  businessName: string;
  category: string;
  score: number;
  avgRating: number;
  reviewCount: number;
}

interface AdminOverviewResponse {
  totals: {
    users: number;
    businesses: number;
    listings: number;
  };
  queues: {
    unreadAdminNotifications: number;
  };
  topBusinesses: TopBusinessResult[];
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const overviewRes = await api.get<AdminOverviewResponse>(apiRoutes.admin.overview);
      return overviewRes.data;
    },
  });

  return (
    <AdminPageShell
      title="Admin Control Plane"
      description="One operational surface for customer, business, moderation, security, and system oversight across BuzzMap."
      status="Initial scaffold active"
    >
      <Card className="overflow-hidden border-primary/15 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_30%),linear-gradient(180deg,rgba(15,37,64,0.05),rgba(15,37,64,0))] shadow-[0_24px_80px_-40px_rgba(15,37,64,0.55)]">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
          <div className="space-y-5">
            <Badge className="w-fit rounded-full border-primary/20 bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
              Admin mission view
            </Badge>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Command surface
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight text-primary">
                    Keep the marketplace visible, trusted, and under control.
                  </h2>
                </div>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                This admin cockpit is optimized for fast scanning: platform volume on the left,
                intervention points in the center, and live quality signals on the right.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {watchTowers.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
                    <Icon className="size-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-border/70 bg-background/90 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between rounded-3xl border border-border/70 bg-card/80 px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Review posture
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">Priority lanes ready</p>
              </div>
              <Eye className="size-5 text-primary" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SignalPill icon={TrendingUp} label="Discovery quality" value="Live" />
              <SignalPill icon={Flame} label="Escalations" value="Visible" />
              <SignalPill icon={BellRing} label="Alert inbox" value="Synced" />
              <SignalPill icon={ShieldAlert} label="Risk watch" value="Active" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Users"
          value={isLoading ? '...' : String(data?.totals.users ?? 0)}
          note="Authenticated accounts currently searchable across all roles."
          icon={Users}
          accent="from-sky-500/15 via-primary/[0.08] to-transparent"
        />
        <MetricCard
          label="Businesses"
          value={isLoading ? '...' : String(data?.totals.businesses ?? 0)}
          note="Marketplace supply-side profiles currently indexed for admin review."
          icon={Building2}
          accent="from-amber-500/20 via-primary/[0.08] to-transparent"
        />
        <MetricCard
          label="Listings"
          value={isLoading ? '...' : String(data?.totals.listings ?? 0)}
          note="Available catalog items currently visible through the authenticated search path."
          icon={Boxes}
          accent="from-emerald-500/15 via-primary/[0.08] to-transparent"
        />
        <MetricCard
          label="Admin Alerts"
          value={isLoading ? '...' : String(data?.queues.unreadAdminNotifications ?? 0)}
          note="Unread in-app notifications currently attached to the signed-in admin account."
          icon={BellRing}
          accent="from-rose-500/15 via-primary/[0.08] to-transparent"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card className="border-border/70 bg-card/80 shadow-[0_20px_60px_-45px_rgba(15,37,64,0.6)]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <CardTitle>Core Areas</CardTitle>
                <CardDescription>
                  Every core admin domain is now represented in the route tree and ready for progressive implementation.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {coreAreas.map(({ title, description, href, icon: Icon }) => (
              <Card
                key={`${href}-${title}`}
                className="group border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.88))] shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_45px_-35px_rgba(15,37,64,0.75)]"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary transition-transform duration-200 group-hover:scale-105">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-2xl border-primary/15 bg-background/80 transition-colors group-hover:border-primary/25 group-hover:bg-primary/[0.03]"
                    nativeButton={false}
                    render={<Link href={href} />}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon data-icon="inline-start" />
                      Open {title}
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(245,158,11,0.08),rgba(15,37,64,0.02))] shadow-[0_24px_60px_-45px_rgba(245,158,11,0.65)]">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-background/90 text-primary shadow-sm">
                  <Star className="size-5" />
                </div>
                <div>
                  <CardTitle>Top Businesses</CardTitle>
                  <CardDescription>
                    Live ranking from the current recommendation service to help admins inspect marketplace quality signals first.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`top-business-skeleton-${index}`} className="h-16 w-full rounded-2xl" />
                ))
              ) : data?.topBusinesses.length ? (
                data.topBusinesses.map((business, index) => (
                  <Link
                    key={`${business.businessId ?? business.businessName}-${index}`}
                    href={appRoutes.business.byId(business.businessId)}
                    className="block rounded-3xl border border-border/70 bg-background/95 px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-[0_18px_45px_-36px_rgba(15,37,64,0.72)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{business.businessName}</p>
                        <p className="text-xs text-muted-foreground">{business.category}</p>
                      </div>
                      <Badge variant="outline">Score {business.score.toFixed(1)}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {business.avgRating.toFixed(1)} rating across {business.reviewCount} reviews
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
                  No ranked businesses are available yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
                  <Activity className="size-5" />
                </div>
                <div>
                  <CardTitle>Operational Focus</CardTitle>
                  <CardDescription>
                    The first concrete admin sections should prioritize investigation and action paths.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {quickActions.map((action, index) => (
                <div
                  key={`quick-action-${index}-${action}`}
                  className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground"
                >
                  <div className="mt-0.5 flex size-7 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
                    {index + 1}
                  </div>
                  <p className="leading-6">{action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageShell>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card className="overflow-hidden border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] shadow-[0_20px_50px_-42px_rgba(15,37,64,0.72)]">
      <CardHeader className="relative space-y-3">
        <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-br ${accent}`} />
        <div className="relative flex items-center justify-between">
          <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
            {label}
          </CardDescription>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-background/90 text-primary shadow-sm">
            <Icon className="size-5" />
          </div>
        </div>
        <CardTitle className="relative text-4xl tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <p className="text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function SignalPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card/80 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
          <Icon className="size-[18px]" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
