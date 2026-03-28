import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, XCircle, Mail, Sparkles, Home } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ROUTES } from '@/utils/constants';
import { apiClient, API_ENDPOINTS } from '@/api/client';
import type { ApiError, VerifyEmailResponse } from '@/api/types';
import { AutoSEO } from '@/components/seo/SEO';

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post<VerifyEmailResponse>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        token,
      });

      setIsSuccess(true);
      toast.success('Email verified successfully!', {
        icon: <CheckCircle className="h-5 w-5" />,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Email verification failed. The link may be invalid or expired.';
      setError(errorMessage);
      toast.error(errorMessage, {
        icon: <XCircle className="h-5 w-5" />,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-verify on mount if token exists in URL
  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl, handleVerify]);

  // Success State - Enhanced with icons and illustrations
  if (isSuccess) {
    return (
      <AuthLayout title="Email Verified!" subtitle="Your email address has been successfully verified. You can now access all features of your account.">
        <div className="text-center space-y-6">
          {/* Animated Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-emerald-500/15 flex items-center justify-center animate-pulse">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-yellow-400 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<ArrowLeft className="h-5 w-5 rotate-180" />}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Continue to Login
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              icon={<Home className="h-3 w-3" />}
              onClick={() => navigate(ROUTES.HOME)}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <AuthLayout title="Verifying your email" subtitle="Please wait while we verify your email address...">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary-500/15 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <AuthLayout title="Verification Failed" subtitle={error}>
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-red-500/15 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<ArrowLeft className="h-5 w-5" />}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Back to Login
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              icon={<Home className="h-3 w-3" />}
              onClick={() => navigate(ROUTES.HOME)}
            >
              Back to Home
            </Button>
            <Link
              to={ROUTES.REGISTER}
              className="block text-sm text-primary-400 hover:text-primary-300 text-center"
            >
              Need to register again?
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // No Token State - Prompt user to check email
  return (
    <>
      <AutoSEO />
      <AuthLayout title="Check Your Email" subtitle="We've sent a verification link to your email address. Please click the link in the email to verify your account.">
        <div className="text-center space-y-6">
          {/* Email Icon */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-primary-500/15 flex items-center justify-center">
              <Mail className="h-12 w-12 text-primary-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<ArrowLeft className="h-5 w-5" />}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Back to Login
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              icon={<Home className="h-4 w-4" />}
              onClick={() => navigate(ROUTES.HOME)}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </AuthLayout>
    </>
  );
};
