'use client';

import Image from 'next/image';
import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Check,
  Copy,
  Download,
  KeyRound,
  MapPin,
  PencilLine,
  QrCode,
  Save,
  ShieldCheck,
  Store,
  UserCheck,
  UserPlus,
  Users,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';
import { DashboardHero, DashboardHeroPill, DashboardMetricCard, DashboardPanel } from '@/components/dashboard/dashboard-surfaces';

interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  role: 'ADMIN' | 'CUSTOMER' | 'BUSINESS_OWNER';
  interests: string[];
  location: string | null;
  profileQrCode: string | null;
  createdAt: string;
  isFollowing: boolean;
  businessProfile?: null | {
    id: string;
    businessName: string;
    description: string;
    category: string;
    type: 'PRODUCTS' | 'SERVICES';
    location: string;
    coordinates: string | null;
    contactInfo: string;
    operatingHours: unknown;
    isVerified: boolean;
  };
  _count?: {
    followers: number;
    following: number;
    povs: number;
  };
}

interface MeProfile extends Omit<UserProfile, 'isFollowing'> {
  email: string;
  phone: string | null;
}

interface Pov {
  id: string;
  caption: string | null;
  starRating: number;
  createdAt: string;
  likesCount?: number;
}

interface BusinessProfileForm {
  businessName: string;
  description: string;
  category: string;
  type: 'PRODUCTS' | 'SERVICES';
  location: string;
  coordinates: string;
  contactInfo: string;
  operatingHours: string;
}

interface AccountForm {
  name: string;
  avatar: string;
  location: string;
  phone: string;
}

function formatOperatingHours(value: unknown): string {
  if (!value) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const currentUserId = session?.user.id;
  const isOwnProfile = currentUserId === id;
  const isBusinessOwner = session?.user.role === 'BUSINESS_OWNER';

  const [accountDraft, setAccountDraft] = useState<AccountForm | null>(null);
  const [interestsDraft, setInterestsDraft] = useState('');
  const [interestsTouched, setInterestsTouched] = useState(false);
  const [businessDraft, setBusinessDraft] = useState<BusinessProfileForm | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile', id],
    queryFn: async () => {
      const res = await api.get(apiRoutes.users.byId(id));
      return res.data as UserProfile;
    },
    enabled: !!session,
  });

  const { data: meProfile } = useQuery<MeProfile>({
    queryKey: ['user-profile-me', id],
    queryFn: async () => {
      const res = await api.get(apiRoutes.users.me);
      return res.data as MeProfile;
    },
    enabled: !!session && isOwnProfile,
  });

  const { data: povsData } = useQuery<{ data: Pov[]; total: number }>({
    queryKey: ['user-povs', id],
    queryFn: async () => {
      const res = await api.get(apiRoutes.pov.byUser(id), { params: { limit: 12 } });
      return res.data as { data: Pov[]; total: number };
    },
    enabled: !!session,
  });

  const { data: ownedBusinessProfile } = useQuery<UserProfile['businessProfile']>({
    queryKey: ['business-profile-for-user-page'],
    queryFn: async () => {
      const res = await api.get(apiRoutes.business.profile);
      return res.data as UserProfile['businessProfile'];
    },
    enabled: !!session && isOwnProfile && isBusinessOwner,
  });

  const accountSource: AccountForm = {
    name: meProfile?.name ?? '',
    avatar: meProfile?.avatar ?? '',
    location: meProfile?.location ?? '',
    phone: meProfile?.phone ?? '',
  };

  const businessSource: BusinessProfileForm | null = ownedBusinessProfile
    ? {
        businessName: ownedBusinessProfile.businessName ?? '',
        description: ownedBusinessProfile.description ?? '',
        category: ownedBusinessProfile.category ?? '',
        type: ownedBusinessProfile.type ?? 'PRODUCTS',
        location: ownedBusinessProfile.location ?? '',
        coordinates: ownedBusinessProfile.coordinates ?? '',
        contactInfo: ownedBusinessProfile.contactInfo ?? '',
        operatingHours: formatOperatingHours(ownedBusinessProfile.operatingHours),
      }
    : null;

  const toggleFollow = useMutation({
    mutationFn: async () => {
      if (profile?.isFollowing) {
        await api.delete(apiRoutes.users.follow(id));
      } else {
        await api.post(apiRoutes.users.follow(id));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', id] });
      toast.success(profile?.isFollowing ? 'Unfollowed' : 'Following');
    },
    onError: () => toast.error('Failed to update follow'),
  });

  const saveAccount = useMutation({
    mutationFn: async () => {
      if (!accountDraft) return;
      await api.patch(apiRoutes.users.me, {
        name: accountDraft.name,
        avatar: accountDraft.avatar || undefined,
        location: accountDraft.location || undefined,
        phone: accountDraft.phone || undefined,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user-profile-me', id] }),
        queryClient.invalidateQueries({ queryKey: ['user-profile', id] }),
      ]);
      toast.success('Account profile updated');
    },
    onError: () => toast.error('Failed to update account profile'),
  });

  const saveInterests = useMutation({
    mutationFn: async () => {
      const interests = (interestsTouched ? interestsDraft : (meProfile?.interests ?? []).join(', '))
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      if (interests.length === 0) {
        throw new Error('no-interests');
      }
      await api.patch(apiRoutes.users.interests, { interests });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user-profile-me', id] }),
        queryClient.invalidateQueries({ queryKey: ['user-profile', id] }),
      ]);
      toast.success('Interests updated');
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'no-interests') {
        toast.error('Add at least one interest');
        return;
      }
      toast.error('Failed to update interests');
    },
  });

  const saveBusinessProfile = useMutation({
    mutationFn: async () => {
      if (!businessDraft) return;
      let operatingHours: Record<string, unknown> | undefined;
      if (businessDraft.operatingHours.trim()) {
        operatingHours = JSON.parse(businessDraft.operatingHours) as Record<string, unknown>;
      }

      await api.patch(apiRoutes.business.profile, {
        businessName: businessDraft.businessName,
        description: businessDraft.description,
        category: businessDraft.category,
        type: businessDraft.type,
        location: businessDraft.location,
        coordinates: businessDraft.coordinates || undefined,
        contactInfo: businessDraft.contactInfo,
        ...(operatingHours ? { operatingHours } : {}),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['business-profile-for-user-page'] }),
        queryClient.invalidateQueries({ queryKey: ['user-profile', id] }),
      ]);
      toast.success('Business profile updated');
    },
    onError: (error) => {
      if (error instanceof SyntaxError) {
        toast.error('Operating hours must be valid JSON');
        return;
      }
      toast.error('Failed to update business profile');
    },
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('mismatch');
      }
      await api.patch(apiRoutes.users.changePassword, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
    },
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.message === 'mismatch') {
        toast.error('New password confirmation does not match');
        return;
      }
      toast.error('Failed to change password');
    },
  });

  const publicInterests = profile?.interests ?? [];
  const povs = povsData?.data ?? [];
  const initials = (profile?.name ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joinedLabel = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '';
  const publicProfileUrl = profile
    ? new URL(
        appRoutes.user.byId(profile.id),
        process.env.NEXT_PUBLIC_SITE_URL ??
          (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      ).toString()
    : '';

  async function copyPublicProfileLink(): Promise<void> {
    if (!publicProfileUrl) {
      toast.error('Profile link unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      toast.success('Profile link copied');
    } catch {
      toast.error('Failed to copy profile link');
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-56 w-full rounded-[28px]" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-[28px]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow={isOwnProfile ? 'Your profile workspace' : 'Public user profile'}
        title={isOwnProfile ? 'Manage your presence and account security.' : profile.name}
        description={
          profile.role === 'BUSINESS_OWNER'
            ? 'This profile connects the person behind a business with the public trust and follow graph around their activity.'
            : 'This profile shows who the user is, what they follow, and the POV activity they have contributed to BuzzMap.'
        }
        icon={isOwnProfile ? PencilLine : Users}
      >
        <DashboardHeroPill
          icon={Users}
          label="Followers"
          value={`${profile._count?.followers ?? 0}`}
          note="People currently following this user account."
        />
        <DashboardHeroPill
          icon={Video}
          label="POVs"
          value={`${profile._count?.povs ?? 0}`}
          note="Published POV reviews currently attached to this profile."
        />
        <DashboardHeroPill
          icon={Store}
          label="Role"
          value={profile.role.replace('_', ' ')}
          note={profile.businessProfile ? 'This user also owns a business profile.' : 'This user is not tied to a business profile.'}
        />
      </DashboardHero>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard
          label="Followers"
          value={String(profile._count?.followers ?? 0)}
          note="Audience size around this profile."
          icon={Users}
          accent="from-sky-500/15 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Following"
          value={String(profile._count?.following ?? 0)}
          note="Accounts this user is currently following."
          icon={UserCheck}
          accent="from-emerald-500/15 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Joined"
          value={joinedLabel}
          note="When this account entered the platform."
          icon={ShieldCheck}
          accent="from-amber-500/18 via-primary/[0.08] to-transparent"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardPanel
          title="Profile Overview"
          description="Public-facing identity, follow state, and high-level account context."
          icon={Users}
        >
          <div className="flex flex-col gap-5 rounded-[28px] border border-border/70 bg-background/90 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <Avatar size="lg">
                  {profile.avatar ? <AvatarImage src={profile.avatar} alt={profile.name} /> : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-primary">{profile.name}</h1>
                    <p className="text-sm text-muted-foreground">
                      {profile.role.replace('_', ' ')}{profile.location ? ` • ${profile.location}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {publicInterests.length > 0 ? (
                      publicInterests.map((interest) => (
                        <Badge key={interest} variant="outline">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">No interests listed yet</Badge>
                    )}
                  </div>
                </div>
              </div>

              {!isOwnProfile ? (
                <Button
                  variant={profile.isFollowing ? 'outline' : 'default'}
                  disabled={toggleFollow.isPending}
                  onClick={() => toggleFollow.mutate()}
                >
                  {profile.isFollowing ? (
                    <>
                      <UserCheck data-icon="inline-start" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus data-icon="inline-start" />
                      Follow
                    </>
                  )}
                </Button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Location</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <MapPin className="size-4 text-primary" />
                  {profile.location ?? 'Not set'}
                </p>
              </div>
              {profile.businessProfile ? (
                <div className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Business</p>
                  <a
                    href={appRoutes.business.byId(profile.businessProfile.id)}
                    className="mt-2 block text-sm font-medium text-primary hover:underline"
                  >
                    {profile.businessProfile.businessName}
                  </a>
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-border/70 bg-card/70 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="overflow-hidden rounded-[24px] border border-border/70 bg-white p-2 shadow-sm">
                    {profile.profileQrCode ? (
                      <Image
                        src={profile.profileQrCode}
                        alt={`${profile.name} profile QR code`}
                        width={112}
                        height={112}
                        unoptimized
                        className="rounded-2xl"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-muted/30 text-muted-foreground">
                        <QrCode className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Profile QR code</p>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Share this community profile in person so one scan opens the live BuzzMap page.
                    </p>
                    {publicProfileUrl ? (
                      <p className="break-all text-xs text-muted-foreground">{publicProfileUrl}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="outline" onClick={() => void copyPublicProfileLink()}>
                    <Copy data-icon="inline-start" />
                    Copy profile link
                  </Button>
                  {profile.profileQrCode ? (
                    <Button
                      type="button"
                      nativeButton={false}
                      render={
                        <a
                          href={profile.profileQrCode}
                          download={`${profile.name.replace(/\s+/g, '-').toLowerCase()}-profile-qr.png`}
                        />
                      }
                    >
                      <Download data-icon="inline-start" />
                      Download QR
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Recent POV Activity"
          description="The latest customer perspective content published by this user."
          icon={Video}
        >
          {povs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-background/85 px-4 py-10 text-center text-sm text-muted-foreground">
              No POVs yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {povs.map((pov) => (
                <div
                  key={pov.id}
                  className="rounded-3xl border border-border/70 bg-background/90 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {pov.caption?.trim() || 'Untitled POV review'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(pov.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{pov.starRating}/5</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>
      </div>

      {isOwnProfile ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <DashboardPanel
            title="Account Details"
            description="Update your shared account identity across BuzzMap."
            icon={PencilLine}
          >
            <FieldGroup className="grid gap-4">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input
                  value={accountDraft?.name ?? accountSource.name}
                  onChange={(event) =>
                    setAccountDraft((current) => ({
                      ...(current ?? accountSource),
                      name: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Avatar URL</FieldLabel>
                <Input
                  value={accountDraft?.avatar ?? accountSource.avatar}
                  onChange={(event) =>
                    setAccountDraft((current) => ({
                      ...(current ?? accountSource),
                      avatar: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Location</FieldLabel>
                <Input
                  value={accountDraft?.location ?? accountSource.location}
                  onChange={(event) =>
                    setAccountDraft((current) => ({
                      ...(current ?? accountSource),
                      location: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Phone</FieldLabel>
                <Input
                  value={accountDraft?.phone ?? accountSource.phone}
                  onChange={(event) =>
                    setAccountDraft((current) => ({
                      ...(current ?? accountSource),
                      phone: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Interests</FieldLabel>
                <Textarea
                  className="min-h-24"
                  value={interestsTouched ? interestsDraft : (meProfile?.interests ?? []).join(', ')}
                  onChange={(event) => {
                    setInterestsTouched(true);
                    setInterestsDraft(event.target.value);
                  }}
                  placeholder="Food, Travel, Beauty, Electronics"
                />
              </Field>
              <div className="flex flex-wrap gap-3">
                <Button disabled={saveAccount.isPending} onClick={() => saveAccount.mutate()}>
                  <Save data-icon="inline-start" />
                  Save Account
                </Button>
                <Button variant="outline" disabled={saveInterests.isPending} onClick={() => saveInterests.mutate()}>
                  <Check data-icon="inline-start" />
                  Save Interests
                </Button>
              </div>
            </FieldGroup>
          </DashboardPanel>

          <DashboardPanel
            title="Account Security"
            description="Change your password directly from your own profile workspace."
            icon={KeyRound}
          >
            <FieldGroup className="grid gap-4">
              <Field>
                <FieldLabel>Current Password</FieldLabel>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>New Password</FieldLabel>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Confirm New Password</FieldLabel>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
              </Field>
              <Button
                disabled={
                  changePassword.isPending ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
                onClick={() => changePassword.mutate()}
              >
                <KeyRound data-icon="inline-start" />
                Change Password
              </Button>
            </FieldGroup>
          </DashboardPanel>

          {isBusinessOwner && businessSource ? (
            <div className="xl:col-span-2">
              <DashboardPanel
                title="Business Profile"
                description="Business owners can update their public business profile from the same workspace."
                icon={Store}
              >
                <FieldGroup className="grid gap-4 xl:grid-cols-2">
                  <Field>
                    <FieldLabel>Business Name</FieldLabel>
                    <Input
                      value={businessDraft?.businessName ?? businessSource.businessName}
                      onChange={(event) =>
                        setBusinessDraft((current) => ({
                          ...(current ?? businessSource),
                          businessName: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Category</FieldLabel>
                    <Input
                      value={businessDraft?.category ?? businessSource.category}
                      onChange={(event) =>
                        setBusinessDraft((current) => ({
                          ...(current ?? businessSource),
                          category: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field className="xl:col-span-2">
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      className="min-h-28"
                      value={businessDraft?.description ?? businessSource.description}
                      onChange={(event) =>
                        setBusinessDraft((current) => ({
                          ...(current ?? businessSource),
                          description: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Business Type</FieldLabel>
                    <Input
                      value={businessDraft?.type ?? businessSource.type}
                      onChange={(event) =>
                        setBusinessDraft((current) => ({
                          ...(current ?? businessSource),
                          type: event.target.value === 'SERVICES' ? 'SERVICES' : 'PRODUCTS',
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Location</FieldLabel>
                    <Input
                      value={businessDraft?.location ?? businessSource.location}
                      onChange={(event) =>
                        setBusinessDraft((current) => ({
                          ...(current ?? businessSource),
                          location: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Coordinates Or Place Query</FieldLabel>
                    <Input
                      value={businessDraft?.coordinates ?? businessSource.coordinates}
                      onChange={(event) =>
                        setBusinessDraft((current) => ({
                          ...(current ?? businessSource),
                          coordinates: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Contact Info</FieldLabel>
                    <Input
                      value={businessDraft?.contactInfo ?? businessSource.contactInfo}
                      onChange={(event) =>
                        setBusinessDraft((current) => ({
                          ...(current ?? businessSource),
                          contactInfo: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field className="xl:col-span-2">
                    <FieldLabel>Operating Hours JSON</FieldLabel>
                    <Textarea
                      className="min-h-32 font-mono text-xs"
                      value={businessDraft?.operatingHours ?? businessSource.operatingHours}
                      onChange={(event) =>
                        setBusinessDraft((current) => ({
                          ...(current ?? businessSource),
                          operatingHours: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <div className="xl:col-span-2">
                    <Button disabled={saveBusinessProfile.isPending} onClick={() => saveBusinessProfile.mutate()}>
                      <Store data-icon="inline-start" />
                      Save Business Profile
                    </Button>
                  </div>
                </FieldGroup>
              </DashboardPanel>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
