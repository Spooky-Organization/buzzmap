import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { MFAForm } from '@/components/forms/MFAForm';
import { ROUTES } from '@/utils/constants';
import { AutoSEO } from '@/components/seo/SEO';

export const MFAVerify = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleVerify = async (_code: string, isBackupCode: boolean) => {
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
    <>
      <AutoSEO />
      <AuthLayout title="Verify Your Identity" subtitle="Enter the code from your authenticator app or use a backup code">
        <MFAForm
          onSubmit={handleVerify}
          isLoading={isLoading}
          error={error}
          showBackupCodeOption={true}
        />
      </AuthLayout>
    </>
  );
};
