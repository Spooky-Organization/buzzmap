import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClass?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
}

/**
 * Input component with forwardRef to support React Hook Form refs
 * 
 * React Hook Form's register() function returns a ref that needs to be forwarded
 * to the actual input element. Using forwardRef allows the Input component to
 * receive and forward this ref properly.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  labelClass,
  error,
  icon,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className={cn('block text-sm font-medium text-gray-700', labelClass)}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 border rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all duration-200',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            icon ? 'pl-10' : 'pl-4',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <span className="text-red-500">•</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

