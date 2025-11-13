import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, XCircle, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/utils/constants';
import { apiClient, API_ENDPOINTS } from '@/api/client';
import type { ApiError, VerifyEmailResponse } from '@/api/types';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card variant="elevated" padding="lg" className="max-w-md w-full">
          <div className="text-center space-y-6">
            {/* Animated Success Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-yellow-400 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-gray-600">
                Your email address has been successfully verified. You can now access all features of your account.
              </p>
            </div>


            {/* Action Button */}
            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={<ArrowLeft className="h-5 w-5 rotate-180" />}
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Continue to Login
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email</h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card variant="elevated" padding="lg" className="max-w-md w-full">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="text-gray-600">
                {error}
              </p>
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
              <Link
                to={ROUTES.REGISTER}
                className="block text-sm text-primary-600 hover:text-primary-700 text-center"
              >
                Need to register again?
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // No Token State - Prompt user to check email
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card variant="elevated" padding="lg" className="max-w-md w-full">
        <div className="text-center space-y-6">
          {/* Email Icon */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
              <Mail className="h-12 w-12 text-primary-600" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
            <p className="text-gray-600">
              We've sent a verification link to your email address. Please click the link in the email to verify your account.
            </p>
          </div>


          {/* Action Button */}
          <div className="pt-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<ArrowLeft className="h-5 w-5" />}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

