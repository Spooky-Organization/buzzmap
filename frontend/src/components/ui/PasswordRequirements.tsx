import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export const PasswordRequirements = ({ password, className }: PasswordRequirementsProps) => {
  if (!password) return null;

  const passwordLength = password.length;

  const requirements = [
    { label: 'At least 8 characters', met: passwordLength >= 8 },
    { label: 'Contains at least one lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains at least one uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains at least one number', met: /[0-9]/.test(password) },
    { label: 'Maximum 128 characters', met: passwordLength <= 128 },
  ];

  const allMet = requirements.every((req) => req.met);

  return (
    <div className={cn('mt-2 p-3 bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)]', className)}>
      <p className="text-xs font-medium text-[var(--foreground)] mb-2">Password Requirements:</p>
      <ul className="space-y-1.5">
        {requirements.map((requirement, index) => (
          <li
            key={index}
            className={cn(
              'flex items-center gap-2 text-xs transition-colors',
              requirement.met ? 'text-emerald-400' : 'text-[var(--foreground-muted)]'
            )}
          >
            {requirement.met ? (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-[var(--foreground-muted)] flex-shrink-0" />
            )}
            <span>{requirement.label}</span>
          </li>
        ))}
      </ul>
      {allMet && (
        <p className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" />
          All requirements met!
        </p>
      )}
    </div>
  );
};
