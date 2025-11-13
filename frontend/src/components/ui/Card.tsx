import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}: CardProps) => {
  const variantStyles = {
    default: 'bg-white shadow-soft',
    elevated: 'bg-white shadow-medium',
    outlined: 'bg-white border-2 border-gray-200',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-xl',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

