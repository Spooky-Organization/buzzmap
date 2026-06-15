'use client';

import { Bell, MessageSquare, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardIntroSkeleton() {
  return (
    <div className="min-w-0 overflow-hidden pb-1">
      <div className="flex min-w-0 items-center gap-4">
        <Skeleton className="h-10 w-1 shrink-0 rounded-full" />
        <Skeleton className="h-8 w-80 max-w-full sm:h-9" />
      </div>
      <Skeleton className="mt-4 h-px w-full" />
    </div>
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

function DashboardHeroSkeleton({
  pillCount = 2,
}: {
  pillCount?: number;
}) {
  const titleWidthClass = pillCount === 1 ? 'w-64' : 'w-80';

  return (
    <div className="min-w-0 overflow-hidden pb-1">
      <div className="flex min-w-0 items-center gap-4">
        <Skeleton className="h-10 w-1 shrink-0 rounded-full" />
        <Skeleton className={`h-8 max-w-full sm:h-9 ${titleWidthClass}`} />
      </div>
      <Skeleton className="mt-4 h-px w-full" />
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

function FeedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card/90 shadow-[0_18px_56px_-44px_rgba(15,37,64,0.62)]">
      <Skeleton className="aspect-video w-full" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ConversationRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-border/60 bg-background/80 px-4 py-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function NotificationRowSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-4">
      <Skeleton className="size-8 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-7 w-20 rounded-xl" />
    </div>
  );
}

function ChatBubbleSkeleton({ align = 'left' }: { align?: 'left' | 'right' }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <Skeleton className={`h-11 rounded-2xl ${align === 'right' ? 'w-52' : 'w-44'}`} />
    </div>
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

export function FeedRouteLoading() {
  return (
    <div className="flex w-full max-w-none flex-col gap-6">
      <DashboardHeroSkeleton pillCount={2} />
      <Card className="border-border/70 bg-card/80 shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
              <PlayCircle className="size-5" />
            </div>
            <div className="space-y-2">
              <CardTitle>Community Feed</CardTitle>
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <FeedCardSkeleton key={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MessagesRouteLoading() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeroSkeleton pillCount={2} />
      <div className="flex justify-end">
        <Skeleton className="h-9 w-40 rounded-2xl" />
      </div>
      <Card className="border-border/70 bg-card/80 shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
              <MessageSquare className="size-5" />
            </div>
            <div className="space-y-2">
              <CardTitle>Conversation List</CardTitle>
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-[24px] border border-border/70 bg-background/90 p-4">
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <ConversationRowSkeleton key={index} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function NotificationsRouteLoading() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeroSkeleton pillCount={2} />
      <div className="flex justify-end">
        <Skeleton className="h-8 w-32 rounded-2xl" />
      </div>
      <Card className="border-border/70 bg-card/80 shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
              <Bell className="size-5" />
            </div>
            <div className="space-y-2">
              <CardTitle>Recent Notifications</CardTitle>
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Card className="overflow-hidden border-0 bg-background/90 shadow-none">
            <CardContent className="flex flex-col gap-0 p-0">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className={index < 4 ? 'border-b border-border/60' : ''}>
                  <NotificationRowSkeleton />
                </div>
              ))}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

export function ConversationRouteLoading() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeroSkeleton pillCount={1} />
      <div className="flex h-[calc(100vh-12rem)] flex-col rounded-[24px] border border-border/70 bg-card shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
        <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
          <Skeleton className="size-7 rounded-xl" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <ChatBubbleSkeleton align="left" />
          <ChatBubbleSkeleton align="right" />
          <ChatBubbleSkeleton align="left" />
          <ChatBubbleSkeleton align="right" />
          <div className="mt-auto rounded-[20px] border border-border/60 bg-background/85 p-3">
            <div className="flex items-end gap-3">
              <Skeleton className="h-10 flex-1 rounded-2xl" />
              <Skeleton className="size-10 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
