'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { appRoutes } from '@/lib/routes';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
  onBack: () => void;
  homeHref?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  onBack,
  homeHref = appRoutes.home,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-lg border-border/70 shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="text-sm leading-6 text-muted-foreground">{message}</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={onRetry} className="gap-2">
              <RefreshCw className="size-4" />
              Try again
            </Button>
            <Button type="button" variant="secondary" onClick={onBack} className="gap-2">
              <ArrowLeft className="size-4" />
              Go back
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href={homeHref} />} className="gap-2">
              <Home className="size-4" />
              Go to home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
