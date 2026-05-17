import type { ReactNode } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-primary/15 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_30%),linear-gradient(180deg,rgba(15,37,64,0.06),rgba(15,37,64,0))] shadow-[0_24px_80px_-42px_rgba(15,37,64,0.58)]">
      <CardContent className="grid gap-5 p-6 lg:grid-cols-[1.25fr_0.95fr] lg:p-8">
        <div className="space-y-4">
          <Badge className="w-fit rounded-full border-primary/20 bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
            {eyebrow}
          </Badge>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Icon className="size-6" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-primary">{title}</h2>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
        </div>
        {children ? <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">{children}</div> : null}
      </CardContent>
    </Card>
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
  description: string;
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
              <CardDescription>{description}</CardDescription>
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
