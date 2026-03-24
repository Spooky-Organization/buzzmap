import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
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
    primary: 'bg-transparent border-2 border-primary-500 text-primary-400 hover:bg-primary-500/10 hover:border-primary-400 focus:ring-primary-500',
    secondary: 'bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 focus:ring-white/50',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/10 focus:ring-gray-500',
    danger: 'bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-500/10 hover:border-red-400 focus:ring-red-500',
    outline: 'bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 focus:ring-white/50',
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

