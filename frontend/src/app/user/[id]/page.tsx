'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface Pov {
  id: string;
  title: string;
  viewCount: number;
  thumbnailUrl?: string;
  createdAt: string;
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/users/${id}`);
      return res.data;
    },
  });

  const { data: povsData } = useQuery<{ povs: Pov[] }>({
    queryKey: ['user-povs', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/pov/user/${id}`);
      return { povs: res.data.povs ?? [] };
    },
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      if (profile?.isFollowing) {
        await api.delete(`/api/v1/users/${id}/follow`);
      } else {
        await api.post(`/api/v1/users/${id}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', id] });
      toast.success(profile?.isFollowing ? 'Unfollowed' : 'Following');
    },
    onError: () => toast.error('Failed to update follow'),
  });

  const currentUserId = (session?.user as { id?: string })?.id;
  const isOwnProfile = currentUserId === id;

  const initials = (profile?.name ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl flex flex-col gap-6 p-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6 p-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-start gap-4">
            <Avatar size="lg">
              {profile.avatarUrl && (
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <h1 className="text-lg font-bold text-primary">{profile.name}</h1>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                </div>
                {session && !isOwnProfile && (
                  <Button
                    variant={profile.isFollowing ? 'outline' : 'default'}
                    size="sm"
                    disabled={toggleFollow.isPending}
                    onClick={() => toggleFollow.mutate()}
                  >
                    {profile.isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{profile.followerCount}</span>
                  <Badge variant="secondary" className="text-xs">followers</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{profile.followingCount}</span>
                  <Badge variant="outline" className="text-xs">following</Badge>
                </div>
              </div>
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}
        </CardContent>
      </Card>

      {/* POVs Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">POVs</h2>
        {(povsData?.povs ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No POVs yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {povsData?.povs.map((pov) => (
              <Card key={pov.id} size="sm" className="cursor-pointer transition-opacity hover:opacity-80">
                <div className="aspect-square rounded-t-xl bg-muted" />
                <CardContent className="flex flex-col gap-0.5">
                  <p className="line-clamp-1 text-xs font-medium">{pov.title}</p>
                  <p className="text-xs text-muted-foreground">{pov.viewCount} views</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
