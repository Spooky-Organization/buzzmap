import { useState } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { MFAForm } from '@/components/forms/MFAForm';
import { ROUTES } from '@/utils/constants';
import { apiClient, API_ENDPOINTS } from '@/api/client';
import { SessionManager } from '@/auth/sessionManager';
import { AutoSEO } from '@/components/seo/SEO';
import type { ApiError, MFAVerifyLoginResponse, MFALoginCompleteResponse } from '@/api/types';

export const MFALogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionManager = SessionManager.getInstance();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Get email from location state (from Login redirect) or URL params
  const email = (location.state as { email?: string })?.email || searchParams.get('email') || '';

  if (!email) {
    // Redirect to login if no email provided
    navigate(ROUTES.LOGIN);
    return null;
  }

  const handleLogin = async (code: string, isBackupCode: boolean) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Step 1: Verify MFA code
      const verifyPayload = isBackupCode
        ? { email, backupCode: code }
        : { email, token: code };

      const verifyResponse = await apiClient.post<MFAVerifyLoginResponse>(
        API_ENDPOINTS.MFA.VERIFY_LOGIN,
        verifyPayload
      );

      if (!verifyResponse.mfaVerified) {
        throw new Error('MFA verification failed');
      }

      // Step 2: Complete login to get tokens
      const completeResponse = await apiClient.post<MFALoginCompleteResponse>(
        API_ENDPOINTS.MFA.COMPLETE_LOGIN,
        { email }
      );

      // Store session using SessionManager
      sessionManager.setSessionFromTokens(
        completeResponse.user,
        completeResponse.tokens.accessToken,
        completeResponse.tokens.refreshToken
      );

      toast.success(
        isBackupCode
          ? 'Login successful with backup code!'
          : 'Login successful!',
        {
          icon: <CheckCircle className="h-5 w-5" />,
        }
      );

      navigate(ROUTES.DASHBOARD);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setError(apiError.message || 'MFA verification failed. Please try again.');
      toast.error(apiError.message || 'MFA verification failed', {
        icon: <XCircle className="h-5 w-5" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AutoSEO />
      <AuthLayout title="Two-Factor Authentication" subtitle="Enter the code from your authenticator app to complete login">
        <MFAForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error}
          showBackupCodeOption={true}
          email={email}
        />

        <div className="mt-6 pt-6 border-t border-[var(--glass-border)]">
          <Link
            to={ROUTES.LOGIN}
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </AuthLayout>
    </>
  );
};
