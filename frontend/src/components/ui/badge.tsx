import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--glass-bg)] text-[var(--foreground-muted)] ring-1 ring-[var(--glass-border)]',
        admin: 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/20',
        accountant: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20',
        user: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20',
        verified: 'bg-emerald-500/15 text-emerald-400',
        unverified: 'bg-red-500/15 text-red-400',
        security: 'bg-red-500/15 text-red-400',
        system: 'bg-blue-500/15 text-blue-400',
        warning: 'bg-amber-500/15 text-amber-400',
        success: 'bg-emerald-500/15 text-emerald-400',
        info: 'bg-blue-500/15 text-blue-400',
        positive: 'bg-emerald-500/15 text-emerald-400',
        negative: 'bg-red-500/15 text-red-400',
        neutral: 'bg-blue-500/15 text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
