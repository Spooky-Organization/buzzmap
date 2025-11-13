import { InputHTMLAttributes, useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { validationManager } from '@/utils/validation';
import { PasswordRequirements } from './PasswordRequirements';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  showStrengthIndicator?: boolean;
  showRequirements?: boolean;
  helperText?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const {
  label,
  error,
  showStrengthIndicator = false,
    showRequirements = false,
  helperText,
  className,
  value,
  onChange,
  id,
    ...inputProps
  } = props;
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `password-${Math.random().toString(36).substr(2, 9)}`;
  
  const password = (value as string) || '';
  const passwordValidation = showStrengthIndicator 
    ? validationManager.validatePassword(password)
    : null;

  const getStrengthText = () => {
    if (!passwordValidation) return '';
    switch (passwordValidation.strength) {
      case 'strong':
        return 'Strong';
      case 'medium':
        return 'Medium';
      case 'weak':
        return 'Weak';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={ref}
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={cn(
            'w-full px-4 py-3 border rounded-lg pr-10 pl-10',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all duration-200',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {showStrengthIndicator && password && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  passwordValidation?.strength === 'strong' ? 'w-full bg-green-500' :
                  passwordValidation?.strength === 'medium' ? 'w-2/3 bg-yellow-500' :
                  password ? 'w-1/3 bg-red-500' : 'w-0'
                )}
              />
            </div>
            {passwordValidation && (
              <span className={cn(
                'text-xs font-medium',
                passwordValidation.strength === 'strong' ? 'text-green-600' :
                passwordValidation.strength === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              )}>
                {getStrengthText()}
              </span>
            )}
          </div>
        </div>
      )}

      {showRequirements && password && (
        <PasswordRequirements password={password} />
      )}
      
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

PasswordInput.displayName = 'PasswordInput';

