import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { isDark } = useTheme();

  const variantStyles = {
    default: isDark 
      ? 'bg-gray-800 border border-gray-700' 
      : 'bg-white shadow-soft',
    elevated: isDark 
      ? 'bg-gray-800 shadow-lg shadow-black/20 border border-gray-700' 
      : 'bg-white shadow-medium',
    outlined: isDark 
      ? 'bg-transparent border-2 border-gray-700' 
      : 'bg-white border-2 border-gray-200',
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
