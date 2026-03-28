import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validationManager } from '@/utils/validation';
import { PasswordRequirements } from './PasswordRequirements';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  labelClass?: string;
  error?: string;
  showStrengthIndicator?: boolean;
  showRequirements?: boolean;
  helperText?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const {
    label,
    labelClass,
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
      case 'strong': return 'Strong';
      case 'medium': return 'Medium';
      case 'weak': return 'Weak';
      default: return '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className={cn('block text-sm font-medium text-[var(--foreground)]', labelClass)}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-muted)]" />
        <input
          ref={ref}
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={cn(
            'glass-input w-full px-4 py-3 pl-10 pr-10',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {showStrengthIndicator && password && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  passwordValidation?.strength === 'strong' ? 'w-full bg-emerald-500' :
                  passwordValidation?.strength === 'medium' ? 'w-2/3 bg-amber-500' :
                  password ? 'w-1/3 bg-red-500' : 'w-0'
                )}
              />
            </div>
            {passwordValidation && (
              <span className={cn(
                'text-xs font-medium',
                passwordValidation.strength === 'strong' ? 'text-emerald-400' :
                passwordValidation.strength === 'medium' ? 'text-amber-400' :
                'text-red-400'
              )}>
                {getStrengthText()}
              </span>
            )}
          </div>
        </div>
      )}

      {showRequirements && password && <PasswordRequirements password={password} />}

      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-400 flex items-center gap-1">
          <span className="text-red-500">•</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-sm text-[var(--foreground-muted)]">
          {helperText}
        </p>
      )}
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
