import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { MFAForm } from '@/components/forms/MFAForm';
import { ROUTES } from '@/utils/constants';

export const MFAVerify = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleVerify = async (code: string, isBackupCode: boolean) => {
    setIsLoading(true);
    setError(undefined);

    // Simulate API call
    setTimeout(() => {
      // Simulate success
      toast.success(
        isBackupCode
          ? 'Backup code verified successfully!'
          : 'MFA code verified successfully!',
        {
          icon: <CheckCircle className="h-5 w-5" />,
        }
      );
      setIsLoading(false);
      // Navigate to dashboard or intended destination
      navigate(ROUTES.DASHBOARD);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Identity</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the code from your authenticator app or use a backup code
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <MFAForm
            onSubmit={handleVerify}
            isLoading={isLoading}
            error={error}
            showBackupCodeOption={true}
          />
        </Card>
      </div>
    </div>
  );
};

