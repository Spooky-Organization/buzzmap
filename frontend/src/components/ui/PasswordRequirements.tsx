import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export const PasswordRequirements = ({ password, className }: PasswordRequirementsProps) => {
  if (!password) return null;

  const passwordLength = password.length;

  const requirements = [
    {
      label: 'At least 8 characters',
      met: passwordLength >= 8,
      errorCode: 'PASSWORD_TOO_SHORT',
    },
    {
      label: 'Contains at least one lowercase letter',
      met: /[a-z]/.test(password),
      errorCode: 'PASSWORD_MISSING_LOWERCASE',
    },
    {
      label: 'Contains at least one uppercase letter',
      met: /[A-Z]/.test(password),
      errorCode: 'PASSWORD_MISSING_UPPERCASE',
    },
    {
      label: 'Contains at least one number',
      met: /[0-9]/.test(password),
      errorCode: 'PASSWORD_MISSING_NUMBER',
    },
    {
      label: 'Maximum 128 characters',
      met: passwordLength <= 128,
      errorCode: 'PASSWORD_TOO_LONG',
    },
  ];

  const allMet = requirements.every(req => req.met);

  return (
    <div className={cn('mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200', className)}>
      <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
      <ul className="space-y-1.5">
        {requirements.map((requirement, index) => (
          <li
            key={index}
            className={cn(
              'flex items-center gap-2 text-xs transition-colors',
              requirement.met ? 'text-green-600' : 'text-gray-500'
            )}
          >
            {requirement.met ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            )}
            <span>{requirement.label}</span>
          </li>
        ))}
      </ul>
      {allMet && (
        <p className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" />
          All requirements met!
        </p>
      )}
    </div>
  );
};

