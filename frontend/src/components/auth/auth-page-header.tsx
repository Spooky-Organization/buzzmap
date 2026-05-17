import { cn } from '@/lib/utils';

export function AuthPageHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2 text-left', className)}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/70">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight text-primary">{title}</h2>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
