'use client';

import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorStateProps {
  title: string;
  message: string;
  onRefresh: () => void;
  onBack: () => void;
}

export function ErrorState({ title, message, onRefresh, onBack }: ErrorStateProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,_var(--color-accent)_18%,_transparent)_0%,_transparent_38%),linear-gradient(180deg,color-mix(in_oklab,_var(--color-primary)_7%,_transparent),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <Card className="relative w-full max-w-xl overflow-hidden border-primary/15 bg-card/95 shadow-[0_28px_90px_-50px_rgba(15,37,64,0.82)] backdrop-blur">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,color-mix(in_oklab,_var(--color-primary)_8%,_transparent),transparent)]" />

        <CardHeader className="relative space-y-4 px-6 pb-0 pt-6 text-center sm:px-8 sm:pt-8">
          <div className="mx-auto inline-flex w-fit items-center rounded-full border border-primary/10 bg-background/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary shadow-sm">
            BuzzMap status
          </div>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <AlertTriangle className="size-6 text-accent" />
          </div>
          <CardTitle className="font-heading text-2xl tracking-tight text-primary sm:text-3xl">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6 px-6 pb-6 pt-5 text-center sm:px-8 sm:pb-8">
          <p className="mx-auto max-w-lg text-sm leading-7 text-muted-foreground">{message}</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={onRefresh} className="rounded-2xl shadow-sm">
              <RefreshCw className="size-4" />
              Refresh page
            </Button>
            <Button type="button" variant="outline" onClick={onBack} className="rounded-2xl">
              <ArrowLeft className="size-4" />
              Go back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
