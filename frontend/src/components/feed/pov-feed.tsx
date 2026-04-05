'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { POVCard, type POVCardData } from './pov-card';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedPage {
  data: POVCardData[];
  nextCursor: string | null;
}

async function fetchFeedPage({ pageParam }: { pageParam: string | null }): Promise<FeedPage> {
  const params = pageParam ? { cursor: pageParam } : {};
  const res = await api.get<FeedPage>('/api/v1/feed', { params });
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
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <p className="text-base font-medium">Failed to load feed</p>
        <p className="text-sm">Please try refreshing the page.</p>
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
