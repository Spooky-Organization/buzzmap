import type { ReactNode } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardHero({
  title,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <header className="min-w-0 overflow-hidden pb-1">
      <div className="flex min-w-0 items-center gap-4">
        <span
          aria-hidden="true"
          className="h-10 w-1 shrink-0 rounded-full bg-[linear-gradient(180deg,hsl(var(--primary)),rgb(245,158,11))] shadow-[0_12px_28px_-16px_rgba(15,37,64,0.72)]"
        />
        <h1 className="min-w-0 max-w-5xl text-2xl font-semibold leading-tight text-primary sm:text-3xl">
          {title}
        </h1>
      </div>
      <div
        aria-hidden="true"
        className="mt-4 h-px w-full bg-[linear-gradient(90deg,rgba(15,37,64,0.22),rgba(245,158,11,0.34),transparent)]"
      />
    </header>
  );
}

export function DashboardHeroPill({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/85 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
        <Icon className="size-5" />
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs leading-6 text-muted-foreground">{note}</p>
    </div>
  );
}

export function DashboardMetricCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
  href,
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  accent: string;
  href?: string;
}) {
  const content = (
    <Card className="overflow-hidden border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] shadow-[0_20px_50px_-42px_rgba(15,37,64,0.72)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20">
      <CardHeader className="relative space-y-3">
        <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-br ${accent}`} />
        <div className="relative flex items-center justify-between">
          <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
            {label}
          </CardDescription>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-background/90 text-primary shadow-sm">
            <Icon className="size-5" />
          </div>
        </div>
        <CardTitle className="relative text-4xl tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent className="relative flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{note}</p>
        {href ? <ArrowRight className="size-4 shrink-0 text-muted-foreground" /> : null}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function DashboardPanel({
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
  children,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
              <Icon className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>{title}</CardTitle>
              {description ? <CardDescription>{description}</CardDescription> : null}
            </div>
          </div>
          {actionLabel && actionHref ? (
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={actionHref} />}>
              {actionLabel}
              <ArrowRight data-icon="inline-end" />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}
