'use client';

import { Hexagon } from 'lucide-react';

interface LoadingScreenProps {
  title?: string;
  message?: string;
}

export function LoadingScreen({
  title = 'Loading BuzzMap',
  message = 'Please wait while we prepare your experience.',
}: LoadingScreenProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,_var(--color-accent)_16%,_transparent)_0%,_transparent_42%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="relative flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-border/60 bg-card/95 px-8 py-10 text-center shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur">
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Hexagon className="size-7 animate-pulse text-accent" />
          <span className="absolute inset-0 rounded-2xl border border-white/10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-accent" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-2xl border border-border/50 bg-muted/70"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
