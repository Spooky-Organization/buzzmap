'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, MessageCircle, Send, Star } from 'lucide-react';
import { toast } from 'sonner';
import { POVMediaGallery, type POVMediaItem } from '@/components/feed/pov-media-gallery';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

interface POVDetail {
  id: string;
  media: POVMediaItem[];
  caption: string | null;
  starRating: number;
  recommends: boolean;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  business: {
    id: string;
    businessName: string;
  } | null;
}

interface POVComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface POVCommentsPage {
  data: POVComment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'size-4',
            i < rating ? 'fill-brand-amber text-brand-amber' : 'fill-muted text-muted-foreground'
          )}
        />
      ))}
    </div>
  );
}

function POVDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-6">
      <Skeleton className="h-10 w-36" />
      <Skeleton className="aspect-video w-full rounded-3xl" />
      <Skeleton className="h-56 w-full rounded-3xl" />
      <Skeleton className="h-72 w-full rounded-3xl" />
    </div>
  );
}

export default function POVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [commentDraft, setCommentDraft] = useState('');

  const {
    data: pov,
    isLoading: isPOVLoading,
    isError: isPOVError,
    refetch: refetchPOV,
  } = useQuery<POVDetail>({
    queryKey: ['pov-detail', id],
    queryFn: async () => {
      const res = await api.get<POVDetail>(apiRoutes.pov.byId(id));
      return res.data;
    },
  });

  const {
    data: commentsPage,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    refetch: refetchComments,
  } = useQuery<POVCommentsPage>({
    queryKey: ['pov-comments', id],
    queryFn: async () => {
      const res = await api.get<POVCommentsPage>(apiRoutes.pov.comments(id), {
        params: { limit: 100 },
      });
      return res.data;
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      const content = commentDraft.trim();
      const res = await api.post<POVComment>(apiRoutes.pov.comments(id), { content });
      return res.data;
    },
    onSuccess: (comment) => {
      setCommentDraft('');
      queryClient.setQueryData<POVCommentsPage>(['pov-comments', id], (current) => {
        if (!current) {
          return { data: [comment], total: 1, page: 1, limit: 100, totalPages: 1 };
        }

        return {
          ...current,
          data: [...current.data, comment],
          total: current.total + 1,
          totalPages: Math.max(1, Math.ceil((current.total + 1) / current.limit)),
        };
      });
      queryClient.setQueryData<POVDetail>(['pov-detail', id], (current) =>
        current ? { ...current, commentsCount: current.commentsCount + 1 } : current
      );
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      if (pov?.business?.id) {
        queryClient.invalidateQueries({ queryKey: ['business-povs', pov.business.id] });
      }
      if (pov?.author.id) {
        queryClient.invalidateQueries({ queryKey: ['user-povs', pov.author.id] });
      }
      toast.success('Comment added');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  if (isPOVLoading) {
    return <POVDetailSkeleton />;
  }

  if (isPOVError || !pov) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold text-primary">POV not available</p>
        <p className="max-w-md text-sm text-muted-foreground">
          BuzzMap could not load this review right now. Refresh the page or go back to the feed.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={() => refetchPOV()}>
            Retry
          </Button>
          <Button type="button" nativeButton={false} render={<Link href={appRoutes.customer.feed} />}>
            Back to feed
          </Button>
        </div>
      </div>
    );
  }

  const comments = commentsPage?.data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-6">
      <Button
        type="button"
        variant="ghost"
        className="w-fit gap-2 px-0 text-sm"
        nativeButton={false}
        render={<Link href={appRoutes.customer.feed} />}
      >
        <ArrowLeft className="size-4" />
        Back to feed
      </Button>

      <Card className="overflow-hidden border-border/70 bg-card/95">
        {pov.media.length > 0 && <POVMediaGallery media={pov.media} />}

        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start gap-3">
            <Link
              href={appRoutes.user.byId(pov.author.id)}
              className="flex items-center gap-3 hover:opacity-80"
            >
              <Avatar size="sm">
                <AvatarImage src={pov.author.avatar ?? undefined} alt={pov.author.name} />
                <AvatarFallback>{initialsFor(pov.author.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">{pov.author.name}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(pov.createdAt)}</p>
              </div>
            </Link>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {pov.business && (
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={appRoutes.business.byId(pov.business.id)} />}
                >
                  {pov.business.businessName}
                </Button>
              )}
              <Badge
                variant={pov.recommends ? 'default' : 'outline'}
                className={pov.recommends ? 'bg-green-600 text-white' : ''}
              >
                {pov.recommends ? 'Recommends' : 'Not recommended'}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <StarRating rating={pov.starRating} />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Heart className={cn('size-4', pov.isLiked ? 'fill-red-500 text-red-500' : '')} />
                {pov.likesCount}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="size-4" />
                {pov.commentsCount}
              </span>
            </div>
          </div>

          {pov.caption && (
            <CardTitle className="text-base font-medium leading-relaxed text-foreground">
              {pov.caption}
            </CardTitle>
          )}
        </CardHeader>
      </Card>

      <Card id="comments" className="border-border/70">
        <CardHeader className="gap-1">
          <CardTitle className="text-lg">Comments</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add context, ask a question, or share your own experience.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Textarea
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder="Write a comment..."
              rows={4}
              maxLength={1000}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">{commentDraft.trim().length}/1000</p>
              <Button
                type="button"
                onClick={() => addComment.mutate()}
                disabled={addComment.isPending || commentDraft.trim().length === 0}
              >
                <Send data-icon="inline-start" />
                Post comment
              </Button>
            </div>
          </div>

          <Separator />

          {isCommentsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isCommentsError ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">Comments failed to load</p>
              <Button type="button" variant="outline" size="sm" onClick={() => refetchComments()}>
                Retry comments
              </Button>
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-5 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No comments yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start the conversation for this POV.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar size="sm">
                    <AvatarImage
                      src={comment.author.avatar ?? undefined}
                      alt={comment.author.name}
                    />
                    <AvatarFallback>{initialsFor(comment.author.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {comment.author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
