import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Key, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { validationManager } from '@/utils/validation';
import { ValidationErrorCode, getErrorMessage } from '@/utils/errorCodes';
import { toast } from 'sonner';

interface MFAFormProps {
  onSubmit: (code: string, isBackupCode: boolean) => void;
  isLoading?: boolean;
  error?: string;
  showBackupCodeOption?: boolean;
  email?: string;
}

export const MFAForm = ({
  onSubmit,
  isLoading = false,
  error,
  showBackupCodeOption = true,
  email,
}: MFAFormProps) => {
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [backupCode, setBackupCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0] && !useBackupCode) {
      inputRefs.current[0]?.focus();
    }
  }, [useBackupCode]);

  const handleTOTPChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...totpCode];
    newCode[index] = value;
    setTotpCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleTOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !totpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleTOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newCode = [...totpCode];
      digits.forEach((digit, index) => {
        if (index < 6) {
          newCode[index] = digit;
        }
      });
      setTotpCode(newCode);

      // Focus last input
      if (inputRefs.current[5]) {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (useBackupCode) {
      const validation = validationManager.validateBackupCode(backupCode);
      if (!validation.valid) {
        toast.error(validation.error || getErrorMessage(ValidationErrorCode.BACKUP_CODE_REQUIRED), {
          icon: <XCircle className="h-5 w-5" />,
        });
        return;
      }
      onSubmit(backupCode, true);
    } else {
      const code = totpCode.join('');
      const validation = validationManager.validateTOTP(code);
      if (!validation.valid) {
        toast.error(validation.error || getErrorMessage(ValidationErrorCode.TOTP_REQUIRED), {
          icon: <XCircle className="h-5 w-5" />,
        });
        return;
      }
      onSubmit(code, false);
    }
  };

  const isTOTPComplete = totpCode.every(digit => digit !== '') && totpCode.length === 6;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {email && (
        <div className="p-4 bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)]">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <span className="font-medium">Email:</span>
            <span>{email}</span>
          </div>
        </div>
      )}

      {!useBackupCode ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
              Enter 6-digit code from your authenticator app
            </label>
            <div className="flex gap-2 justify-center">
              {totpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleTOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleTOTPKeyDown(index, e)}
                  onPaste={index === 0 ? handleTOTPPaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--foreground)]"
                  aria-label={`Digit ${index + 1} of 6`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--foreground-muted)] text-center">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {showBackupCodeOption && (
            <button
              type="button"
              onClick={() => setUseBackupCode(true)}
              className="w-full text-sm text-primary-400 hover:text-primary-300 flex items-center justify-center gap-2 py-2"
            >
              <Key className="h-4 w-4" />
              Use backup code instead
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Enter your backup code
            </label>
            <Input
              type="text"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX"
              icon={<Key className="h-5 w-5" />}
              error={error}
              helperText="Enter one of your backup codes"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setUseBackupCode(false);
              setBackupCode('');
            }}
            className="w-full text-sm text-primary-400 hover:text-primary-300 flex items-center justify-center gap-2 py-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Use authenticator app code instead
          </button>
        </div>
      )}

      {error && !useBackupCode && (
        <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        icon={useBackupCode ? <Key className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        isLoading={isLoading}
        disabled={!useBackupCode ? !isTOTPComplete : !backupCode.trim()}
      >
        {useBackupCode ? 'Verify Backup Code' : 'Verify Code'}
      </Button>
    </form>
  );
};
