import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarIcon, CheckCircleIcon } from 'lucide-react';

interface BusinessCardProps {
  business: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    category: string;
    logoUrl?: string;
    coverImageUrl?: string;
    isVerified: boolean;
    avgRating: number;
    totalReviews: number;
  };
  compact?: boolean;
  className?: string;
}

export function BusinessCard({ business, compact = false, className }: BusinessCardProps) {
  if (compact) {
    return (
      <Card
        className={cn('group cursor-pointer overflow-hidden', className)}
        onClick={() => window.location.href = `/business/${business.slug}`}
      >
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img
            src={business.coverImageUrl || '/placeholder-business.jpg'}
            alt={business.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {business.isVerified && (
            <Badge className="absolute bottom-2 left-2" variant="default">
              <CheckCircleIcon className="size-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={business.logoUrl} />
              <AvatarFallback>{business.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{business.name}</p>
              <p className="text-xs text-muted-foreground truncate">{business.category}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn('group cursor-pointer', className)}
      onClick={() => window.location.href = `/business/${business.slug}`}
    >
      <div className="h-32 bg-gradient-to-br from-navy-800 to-navy-900 relative overflow-hidden">
        <img
          src={business.coverImageUrl || '/placeholder-business.jpg'}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {business.isVerified && (
          <Badge className="absolute bottom-3 left-3" variant="default">
            <CheckCircleIcon className="size-3 mr-1" />
            Verified
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 -mt-10 mb-3">
          <Avatar className="size-14 border-4 border-background shadow-md">
            <AvatarImage src={business.logoUrl} />
            <AvatarFallback className="text-lg">{business.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <h3 className="font-semibold truncate">{business.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{business.category}</p>
        {business.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {business.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <StarIcon className="size-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">{business.avgRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({business.totalReviews} reviews)</span>
        </div>
      </CardContent>
    </Card>
  );
}
