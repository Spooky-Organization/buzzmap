import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';

  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800',
    secondary: 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const displayIcon = isLoading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : icon ? (
    <span className={cn(size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')}>{icon}</span>
  ) : null;

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {iconPosition === 'left' && displayIcon}
      {children}
      {iconPosition === 'right' && displayIcon}
    </button>
  );
};

