'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';
import { POVCard, type POVCardData } from './pov-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface FeedPage {
  data: POVCardData[];
  nextCursor: string | null;
}

async function fetchFeedPage({ pageParam }: { pageParam: string | null }): Promise<FeedPage> {
  const params = pageParam ? { cursor: pageParam } : {};
  const res = await api.get<FeedPage>(apiRoutes.feed.root, { params });
  return res.data;
}

function POVCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden ring-1 ring-foreground/10">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function POVFeed() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: fetchFeedPage,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <POVCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-border/70 bg-card/90 px-6 py-16 text-center shadow-[0_18px_56px_-44px_rgba(15,37,64,0.62)]">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <RefreshCw className="size-5 text-accent" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-primary">Failed to load feed</p>
          <p className="text-sm text-muted-foreground">
            BuzzMap could not fetch the latest POVs right now. Refresh the feed and try again.
          </p>
        </div>
        <Button type="button" onClick={() => refetch()} className="rounded-2xl">
          <RefreshCw data-icon="inline-start" />
          Refresh feed
        </Button>
      </div>
    );
  }

  const allPOVs = data?.pages.flatMap((page) => page.data) ?? [];

  if (allPOVs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <p className="text-base font-medium">No POVs yet</p>
        <p className="text-sm">Follow businesses or users to see their POVs here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {allPOVs.map((pov) => (
        <POVCard key={pov.id} pov={pov} />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="py-2">
        {isFetchingNextPage && (
          <div className="flex flex-col gap-4">
            <POVCardSkeleton />
          </div>
        )}
        {!hasNextPage && allPOVs.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">You&apos;ve reached the end</p>
        )}
      </div>
    </div>
  );
}
