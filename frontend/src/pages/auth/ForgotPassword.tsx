import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, XCircle, CheckCircle, Home } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { validationManager } from '@/utils/validation';
import { ValidationErrorCode, getErrorMessage } from '@/utils/errorCodes';
import { ROUTES } from '@/utils/constants';
import { apiClient, API_ENDPOINTS } from '@/api/client';
import type { ApiError, ForgotPasswordResponse } from '@/api/types';
import { AutoSEO } from '@/components/seo/SEO';

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    clearErrors,
    setError,
  } = useForm<ForgotPasswordFormData>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    clearErrors();

    const emailValid = await trigger('email');
    if (!emailValid) {
      setIsLoading(false);
      toast.error('Please fix the errors in the form', {
        icon: <XCircle className="h-5 w-5" />,
      });
      return;
    }

    const validation = validationManager.validateForgotPasswordForm(data.email);
    if (!validation.valid) {
      toast.error(validation.error || getErrorMessage(ValidationErrorCode.EMAIL_INVALID), {
        icon: <XCircle className="h-5 w-5" />,
      });
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.post<ForgotPasswordResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: data.email,
      });

      setIsSuccess(true);
      toast.success('Password reset email sent!', {
        icon: <CheckCircle className="h-5 w-5" />,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      
      if (apiError.details?.field) {
        setError(apiError.details.field as keyof ForgotPasswordFormData, {
          type: 'manual',
          message: apiError.details.message || apiError.message,
        });
      } else {
        toast.error(apiError.message || 'Failed to send reset email. Please try again.', {
          icon: <XCircle className="h-5 w-5" />,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to your email address.
          </p>
          <div className="space-y-3">
            <Link to={ROUTES.LOGIN}>
              <Button variant="primary" className="w-full" icon={<ArrowLeft className="h-5 w-5" />}>
                Back to login
              </Button>
            </Link>
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
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <AutoSEO />
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Forgot your password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              icon={<Mail className="h-5 w-5" />}
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: {
                  value: true,
                  message: getErrorMessage(ValidationErrorCode.EMAIL_REQUIRED),
                },
                validate: async (value) => {
                  const result = validationManager.validateEmail(value);
                  if (!result.valid) {
                    return result.error || getErrorMessage(result.errorCode || ValidationErrorCode.EMAIL_INVALID);
                  }
                  return true;
                },
                onBlur: () => trigger('email'),
              })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              icon={<Mail className="h-5 w-5" />}
              isLoading={isLoading}
            >
              Send reset link
            </Button>

            <div className="space-y-3">
              <Link
                to={ROUTES.LOGIN}
                className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
              
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                icon={<Home className="h-3 w-3" />}
                onClick={() => navigate(ROUTES.HOME)}
              >
                Back to Home
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

