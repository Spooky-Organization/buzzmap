import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarIcon, HeartIcon, MessageCircleIcon, ShareIcon } from 'lucide-react';

interface POVCardProps {
  pov: {
    id: string;
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO';
    thumbnailUrl?: string;
    caption?: string;
    starRating: number;
    recommends: boolean;
    likeCount: number;
    commentCount: number;
    author: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
    business: {
      name: string;
    };
  };
  compact?: boolean;
  className?: string;
}

export function POVCard({ pov, compact = false, className }: POVCardProps) {
  const initials = `${pov.author.firstName[0]}${pov.author.lastName[0]}`;

  if (compact) {
    return (
      <Card className={cn('overflow-hidden group cursor-pointer', className)}>
        <div className="aspect-video relative overflow-hidden">
          <img
            src={pov.mediaUrl}
            alt={pov.caption || 'POV media'}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {pov.mediaType === 'VIDEO' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-12 rounded-full bg-black/50 flex items-center justify-center">
                <svg className="size-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
          <Badge
            className="absolute top-2 right-2"
            variant={pov.recommends ? 'default' : 'secondary'}
          >
            {pov.recommends ? 'Recommended' : 'Skip'}
          </Badge>
        </div>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={pov.author.avatarUrl} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 text-xs">
              <span className="font-medium truncate max-w-[80px]">{pov.author.firstName}</span>
              <span className="text-muted-foreground">·</span>
              <StarIcon className="size-3 fill-amber-400 text-amber-400" />
              <span>{pov.starRating}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="aspect-video relative">
        <img
          src={pov.mediaUrl}
          alt={pov.caption || 'POV media'}
          className="w-full h-full object-cover"
        />
        {pov.mediaType === 'VIDEO' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-16 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/60 transition-colors">
              <svg className="size-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
        <Badge
          className="absolute top-3 right-3"
          variant={pov.recommends ? 'default' : 'secondary'}
        >
          {pov.recommends ? 'Recommended' : 'Skip'}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={pov.author.avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{pov.author.firstName}</p>
            <p className="text-sm text-muted-foreground truncate">{pov.business.name}</p>
          </div>
          <div className="flex items-center gap-1">
            <StarIcon className="size-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{pov.starRating}</span>
          </div>
        </div>
        {pov.caption && (
          <p className="mt-3 text-sm line-clamp-2">{pov.caption}</p>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <button className="flex items-center gap-1 hover:text-primary transition-colors">
            <HeartIcon className="size-4" />
            <span>{pov.likeCount}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-primary transition-colors">
            <MessageCircleIcon className="size-4" />
            <span>{pov.commentCount}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-primary transition-colors ml-auto">
            <ShareIcon className="size-4" />
            <span>Share</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
