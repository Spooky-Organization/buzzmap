'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  Mail,
  MapPin,
  Shield,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';

interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: 'ADMIN' | 'CUSTOMER' | 'BUSINESS_OWNER';
  location: string | null;
  createdAt: string;
  businessProfile: null | {
    id: string;
    businessName: string;
    category: string;
    isVerified: boolean;
  };
}

interface UserProfileResponse {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  interests: string[];
  location: string | null;
  createdAt: string;
  businessProfile?: null | {
    id: string;
    businessName: string;
    description: string;
    category: string;
    type: string;
    location: string;
    contactInfo: string;
    isVerified: boolean;
  };
  _count?: {
    followers: number;
    following: number;
    povs: number;
  };
}

interface PovItem {
  id: string;
  business: { id: string; businessName: string } | null;
  caption: string | null;
  starRating: number | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface PovResponse {
  data: PovItem[];
  total: number;
}

function roleBadgeVariant(role: AdminUserListItem['role']) {
  if (role === 'ADMIN') return 'destructive' as const;
  if (role === 'BUSINESS_OWNER') return 'secondary' as const;
  return 'outline' as const;
}

export function AdminUserDetailDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['admin-user-profile', user?.id],
    queryFn: async () => {
      const res = await api.get<UserProfileResponse>(apiRoutes.users.byId(user!.id));
      return res.data;
    },
    enabled: open && !!user,
  });

  const { data: povsData, isLoading: povsLoading } = useQuery({
    queryKey: ['admin-user-povs', user?.id],
    queryFn: async () => {
      const res = await api.get<PovResponse>(apiRoutes.pov.byUser(user!.id), {
        params: { page: 1, limit: 6 },
      });
      return res.data;
    },
    enabled: open && !!user,
  });

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = profile?.createdAt ?? user?.createdAt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>User Review</DialogTitle>
          <DialogDescription>
            Inspect profile, role, business context, and recent POV activity without leaving the admin workspace.
          </DialogDescription>
        </DialogHeader>

        {!user ? null : (
          <div className="grid gap-6">
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="border-border/70">
                <CardContent>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar size="lg">
                        <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-semibold text-primary">{user.name}</h2>
                          <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <Mail className="size-4" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin className="size-4" />
                            {profile?.location ?? user.location ?? 'Location not set'}
                          </span>
                          <span className="flex items-center gap-2">
                            <CalendarDays className="size-4" />
                            Joined {joinedDate ? new Date(joinedDate).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {profileLoading ? (
                      <Skeleton className="h-20 w-full rounded-2xl md:w-56" />
                    ) : (
                      <div className="grid w-full gap-3 md:w-56">
                        <MetricChip icon={Users} label="Followers" value={profile?._count?.followers ?? 0} />
                        <MetricChip icon={Shield} label="Following" value={profile?._count?.following ?? 0} />
                        <MetricChip icon={Video} label="POVs" value={profile?._count?.povs ?? 0} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-primary/[0.03]">
                <CardHeader>
                  <CardTitle>Business Context</CardTitle>
                  <CardDescription>
                    Business-owner context stays inside the admin workspace instead of redirecting out.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profileLoading ? (
                    <Skeleton className="h-32 rounded-2xl" />
                  ) : profile?.businessProfile ? (
                    <div className="space-y-3 rounded-2xl border border-border/70 bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{profile.businessProfile.businessName}</p>
                          <p className="text-sm text-muted-foreground">
                            {profile.businessProfile.category} • {profile.businessProfile.type}
                          </p>
                        </div>
                        <Badge variant={profile.businessProfile.isVerified ? 'default' : 'outline'}>
                          {profile.businessProfile.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{profile.businessProfile.location}</p>
                      <p className="text-sm text-muted-foreground">{profile.businessProfile.contactInfo}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
                      This user does not have an attached business profile.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Card className="border-border/70">
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                  <CardDescription>Customer preference signals currently attached to the account.</CardDescription>
                </CardHeader>
                <CardContent>
                  {profileLoading ? (
                    <Skeleton className="h-24 rounded-2xl" />
                  ) : (profile?.interests.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile?.interests.map((interest) => (
                        <Badge key={interest} variant="secondary">
                          <Sparkles data-icon="inline-start" />
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No interests set for this account.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardHeader>
                  <CardTitle>Recent POV Activity</CardTitle>
                  <CardDescription>Latest POV posts from this account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {povsLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-20 rounded-2xl" />
                    ))
                  ) : (povsData?.data.length ?? 0) > 0 ? (
                    povsData?.data.map((pov) => (
                      <div
                        key={pov.id}
                        className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {pov.caption?.trim() || 'Untitled POV review'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {pov.business?.businessName ?? 'Personal experience'}
                            </p>
                          </div>
                          {pov.starRating !== null ? (
                            <Badge variant="outline">{pov.starRating}/5</Badge>
                          ) : (
                            <Badge variant="outline">Experience</Badge>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{new Date(pov.createdAt).toLocaleDateString()}</span>
                          <span>{pov.likesCount} likes</span>
                          <span>{pov.commentsCount} comments</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No POV activity for this user yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MetricChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-primary">{value}</p>
    </div>
  );
}
