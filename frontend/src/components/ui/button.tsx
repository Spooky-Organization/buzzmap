/* eslint-disable react-refresh/only-export-components */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800 shadow-sm',
        secondary:
          'bg-transparent border-2 border-[var(--glass-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)] focus:ring-primary-500',
        ghost:
          'bg-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] focus:ring-primary-500',
        danger:
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800 shadow-sm',
        outline:
          'bg-transparent border-2 border-[var(--glass-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)] focus:ring-primary-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      icon,
      iconPosition = 'left',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    const displayIcon = isLoading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : icon ? (
      icon
    ) : null;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {iconPosition === 'left' && displayIcon}
        {children}
        {iconPosition === 'right' && displayIcon}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
