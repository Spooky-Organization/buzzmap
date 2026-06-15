'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { appRoutes, apiRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { POVMediaGallery, type POVMediaItem } from './pov-media-gallery';

export interface POVCardData {
  id: string;
  media: POVMediaItem[];
  caption: string | null;
  starRating: number | null;
  recommends: boolean | null;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
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

interface POVCardProps {
  pov: POVCardData;
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

export function POVCard({ pov }: POVCardProps) {
  const [liked, setLiked] = useState(pov.isLiked);
  const [likesCount, setLikesCount] = useState(pov.likesCount);
  const [isLiking, setIsLiking] = useState(false);

  const initials = pov.author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleLike() {
    if (isLiking) return;
    setIsLiking(true);
    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setLikesCount((c) => c + (wasLiked ? -1 : 1));
    try {
      if (wasLiked) {
        await api.delete(apiRoutes.pov.like(pov.id));
      } else {
        await api.post(apiRoutes.pov.like(pov.id));
      }
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLikesCount((c) => c + (wasLiked ? 1 : -1));
    } finally {
      setIsLiking(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Mixed image / video gallery */}
      {pov.media.length > 0 && <POVMediaGallery media={pov.media} />}

      <CardHeader className="gap-2">
        {/* Author + Business row */}
        <div className="flex items-center gap-3">
          <Link href={appRoutes.user.byId(pov.author.id)} className="flex items-center gap-2 hover:opacity-80">
            <Avatar size="sm">
              <AvatarImage src={pov.author.avatar ?? undefined} alt={pov.author.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{pov.author.name}</span>
          </Link>

          {pov.business && (
            <>
              <span className="text-muted-foreground text-xs">at</span>
              <Link
                href={`/business/${pov.business.id}`}
                className="text-sm font-medium text-brand-amber hover:underline"
              >
                {pov.business.businessName}
              </Link>
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            {pov.recommends !== null ? (
              <Badge variant={pov.recommends ? 'default' : 'outline'} className={pov.recommends ? 'bg-green-600 text-white' : ''}>
                {pov.recommends ? 'Recommends' : 'Not recommended'}
              </Badge>
            ) : (
              <Badge variant="outline">Experience</Badge>
            )}
          </div>
        </div>

        {/* Rating */}
        {pov.starRating !== null ? <StarRating rating={pov.starRating} /> : null}
      </CardHeader>

      <CardContent>
        {pov.caption && (
          <p className="text-sm text-foreground leading-relaxed">{pov.caption}</p>
        )}
      </CardContent>

      <CardFooter className="flex items-center gap-4 border-t bg-muted/30 px-4 py-2">
        {/* Like */}
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1.5', liked && 'text-red-500')}
          onClick={handleLike}
          disabled={isLiking}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart className={cn(liked && 'fill-red-500')} />
          <span className="text-xs">{likesCount}</span>
        </Button>

        {/* Comment */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          nativeButton={false}
          render={<Link href={`${appRoutes.customer.pov(pov.id)}#comments`} />}
        >
          <MessageCircle />
          <span className="text-xs">{pov.commentsCount}</span>
        </Button>

        <span className="ml-auto text-xs text-muted-foreground">
          {formatRelativeTime(pov.createdAt)}
        </span>
      </CardFooter>
    </Card>
  );
}
