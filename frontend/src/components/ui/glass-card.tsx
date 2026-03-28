import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const glassCardVariants = cva(
  'rounded-2xl backdrop-blur-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--card-bg)] border border-[var(--card-border)] shadow-glass',
        elevated:
          'bg-[var(--card-bg)] border border-[var(--card-border)] shadow-glass hover:bg-[var(--card-hover)]',
        outlined:
          'bg-transparent border-2 border-[var(--card-border)]',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface GlassCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(glassCardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);
GlassCard.displayName = 'GlassCard';

// Backward-compatible alias
const Card = GlassCard;

export { GlassCard, Card, glassCardVariants };
