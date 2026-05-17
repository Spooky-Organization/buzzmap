'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardIntroSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="grid gap-5 p-6 lg:grid-cols-[1.25fr_0.95fr] lg:p-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-36 rounded-full" />
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-2xl" />
              <Skeleton className="h-10 w-72 max-w-full" />
            </div>
            <Skeleton className="h-4 w-[32rem] max-w-full" />
            <Skeleton className="h-4 w-[24rem] max-w-full" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-border/60 p-4">
              <Skeleton className="mb-3 size-10 rounded-2xl" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-4 w-24" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden border-border/60">
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-14" />
              </div>
              <Skeleton className="size-10 rounded-2xl" />
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ListCardSkeleton({
  title,
  rows = 3,
}: {
  title: string;
  rows?: number;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-4"
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CustomerDashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardIntroSkeleton />
      <StatGridSkeleton />
      <div className="grid gap-6 md:grid-cols-2">
        <ListCardSkeleton title="Active Orders" />
        <ListCardSkeleton title="Recent POVs" />
      </div>
    </div>
  );
}

export function BusinessDashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardIntroSkeleton />
      <StatGridSkeleton />
      <ListCardSkeleton title="Recent POVs" rows={4} />
    </div>
  );
}

export function AnalyticsDashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardIntroSkeleton />
      <StatGridSkeleton />
    </div>
  );
}
