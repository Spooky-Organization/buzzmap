'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Bell,
  Compass,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  Plus,
  Sparkles,
  Star,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomerDashboardLoading } from '@/components/dashboard/loading-skeletons';
import {
  DashboardHero,
  DashboardPanel,
} from '@/components/dashboard/dashboard-surfaces';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CustomerProfile {
  id: string;
  name: string;
  avatar: string | null;
  interests: string[];
  location: string | null;
  createdAt: string;
  _count?: {
    followers: number;
    following: number;
    povs: number;
  };
}

interface CustomerPOV {
  id: string;
  business: { id: string; businessName: string } | null;
  media: Array<{ id: string; type: 'image' | 'video'; url: string; thumbnailUrl: string | null }>;
  caption: string | null;
  starRating: number | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface SearchUserResult {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

interface DashboardData {
  profile: CustomerProfile;
  recentPovs: CustomerPOV[];
  discoverPeople: SearchUserResult[];
  unreadNotifications: number;
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateString));
}

function statLabel(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

export default function CustomerDashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['customer-social-dashboard'],
    queryFn: async () => {
      const [profileRes, povsRes, notifsRes, peopleRes] = await Promise.all([
        api.get<CustomerProfile>(apiRoutes.users.me),
        api.get<PaginatedResponse<CustomerPOV>>(apiRoutes.pov.mine, {
          params: { limit: 6 },
        }),
        api.get<{ unreadCount?: number }>(apiRoutes.notifications.root, {
          params: { limit: 1 },
        }),
        api.get<PaginatedResponse<SearchUserResult>>(apiRoutes.search.users, {
          params: { limit: 12 },
        }),
      ]);

      const profile = profileRes.data;
      const discoverPeople = (peopleRes.data.data ?? [])
        .filter((user) => user.id !== profile.id)
        .slice(0, 6);

      return {
        profile,
        recentPovs: povsRes.data.data ?? [],
        discoverPeople,
        unreadNotifications: notifsRes.data.unreadCount ?? 0,
      };
    },
    enabled: !!session,
  });

  if (isLoading) {
    return <CustomerDashboardLoading />;
  }

  const profile = data?.profile;
  const counts = profile?._count;
  const interests = profile?.interests ?? [];
  const visibleInterests = interests.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Customer home"
        title={`Welcome back, ${firstName}`}
        icon={Compass}
      />

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] p-5 shadow-[0_22px_70px_-50px_rgba(15,37,64,0.68)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-16 border border-primary/10 shadow-sm">
                {profile?.avatar ? <AvatarImage src={profile.avatar} alt={profile.name} /> : null}
                <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                  {initialsFor(profile?.name ?? firstName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-foreground">{profile?.name ?? session?.user?.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {profile?.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {profile.location}
                    </span>
                  ) : (
                    <span>BuzzMap customer profile</span>
                  )}
                  <span>Joined {profile?.createdAt ? formatDate(profile.createdAt) : 'recently'}</span>
                </div>
              </div>
            </div>
            {profile ? (
              <Button variant="outline" nativeButton={false} render={<Link href={appRoutes.user.byId(profile.id)} />}>
                Open profile
              </Button>
            ) : null}
          </div>

          <TooltipProvider delay={150}>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: 'POV experiences', value: counts?.povs ?? 0, icon: Star },
                { label: 'Followers', value: counts?.followers ?? 0, icon: Users },
                { label: 'Following', value: counts?.following ?? 0, icon: UserCheck },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Tooltip key={stat.label}>
                    <TooltipTrigger className="flex flex-col items-center gap-1 rounded-2xl border border-border/70 bg-background/80 px-2 py-3 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Icon className="size-4 text-muted-foreground" aria-hidden />
                      <span className="text-2xl font-semibold text-primary">{stat.value}</span>
                      <span className="sr-only">{stat.label}</span>
                    </TooltipTrigger>
                    <TooltipContent>{stat.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>

          <div className="mt-5 flex flex-wrap gap-2">
            {visibleInterests.length > 0 ? (
              visibleInterests.map((interest) => (
                <Badge key={interest} variant="outline" className="rounded-full">
                  {interest}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="rounded-full">
                Add interests from your profile
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button
            className="h-auto justify-start rounded-[24px] p-5 text-left"
            nativeButton={false}
            render={<Link href={appRoutes.customer.povCreate} />}
          >
            <Plus data-icon="inline-start" />
            Share a POV
          </Button>
          <Button
            className="h-auto justify-start rounded-[24px] p-5 text-left"
            variant="outline"
            nativeButton={false}
            render={<Link href={appRoutes.customer.feed} />}
          >
            <Video data-icon="inline-start" />
            Browse feed
          </Button>
          <Button
            className="h-auto justify-start rounded-[24px] p-5 text-left"
            variant="outline"
            nativeButton={false}
            render={<Link href={appRoutes.customer.messages} />}
          >
            <MessageSquare data-icon="inline-start" />
            Message people
          </Button>
          <Button
            className="h-auto justify-start rounded-[24px] p-5 text-left"
            variant={data?.unreadNotifications ? 'default' : 'outline'}
            nativeButton={false}
            render={<Link href={appRoutes.customer.notifications} />}
          >
            <Bell data-icon="inline-start" />
            {data?.unreadNotifications ? statLabel(data.unreadNotifications, 'alert') : 'No unread alerts'}
          </Button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardPanel
          title="Recent Experiences"
          description="Your latest POVs and personal posts are the social proof people see around BuzzMap."
          icon={Sparkles}
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
            <div className="grid gap-3">
              {data?.recentPovs.map((pov) => (
                <Link
                  key={pov.id}
                  href={appRoutes.customer.pov(pov.id)}
                  className="group rounded-3xl border border-border/70 bg-background/90 p-4 transition-colors hover:border-primary/25 hover:bg-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={pov.business ? 'default' : 'outline'}>
                          {pov.business?.businessName ?? 'Personal experience'}
                        </Badge>
                        {pov.starRating !== null ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                            <Star className="size-3.5 fill-current" />
                            {pov.starRating}/5
                          </span>
                        ) : null}
                      </div>
                      <p className="line-clamp-2 text-sm font-medium text-foreground">
                        {pov.caption?.trim() || 'Shared a media POV'}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(pov.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="size-3.5" />
                        {pov.likesCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="size-3.5" />
                        {pov.commentsCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="People Discovery"
          description="Find customers and creators to follow, view, or message from one place."
          icon={Users}
          actionLabel="Open messages"
          actionHref={appRoutes.customer.messages}
        >
          {(data?.discoverPeople.length ?? 0) === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-background/85 px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">No people are available to discover yet.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {data?.discoverPeople.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-3xl border border-border/70 bg-background/90 px-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar>
                      {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                      <AvatarFallback>{initialsFor(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role.replace(/_/g, ' ').toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" nativeButton={false} render={<Link href={appRoutes.user.byId(user.id)} aria-label={`View ${user.name}`} />}>
                      <Eye />
                    </Button>
                    <Button size="icon" nativeButton={false} render={<Link href={`${appRoutes.customer.messages}?person=${encodeURIComponent(user.name)}`} aria-label={`Message ${user.name}`} />}>
                      <MessageSquare />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}
