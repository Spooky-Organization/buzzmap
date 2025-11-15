import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Key, CheckCircle, ArrowLeft, XCircle, Home } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card } from '@/components/ui/Card';
import { validationManager } from '@/utils/validation';
import { ValidationErrorCode, getErrorMessage } from '@/utils/errorCodes';
import { ROUTES } from '@/utils/constants';
import { apiClient, API_ENDPOINTS } from '@/api/client';
import type { ApiError, ResetPasswordResponse } from '@/api/types';
import { AutoSEO } from '@/components/seo/SEO';

interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    clearErrors,
    setError,
  } = useForm<ResetPasswordFormData>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      token: tokenFromUrl || '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    clearErrors();

    const fieldsToValidate = tokenFromUrl 
      ? ['password', 'confirmPassword'] as const
      : ['token', 'password', 'confirmPassword'] as const;
    
    const validationResults = await Promise.all(
      fieldsToValidate.map(field => trigger(field))
    );
    
    if (validationResults.some(result => !result)) {
      setIsLoading(false);
      toast.error('Please fix the errors in the form', {
        icon: <XCircle className="h-5 w-5" />,
      });
      return;
    }

    const validation = validationManager.validateResetPasswordForm(
      data.password,
      data.confirmPassword,
      data.token
    );

    if (!validation.valid && validation.fieldErrors) {
      Object.entries(validation.fieldErrors).forEach(([field, error]) => {
        setError(field as keyof ResetPasswordFormData, {
          type: 'manual',
          message: error.message,
        });
      });
      setIsLoading(false);
      toast.error('Please check all fields and try again', {
        icon: <XCircle className="h-5 w-5" />,
      });
      return;
    }

    try {
      await apiClient.post<ResetPasswordResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token: data.token,
        password: data.password,
      });

      setIsSuccess(true);
      toast.success('Password reset successful!', {
        icon: <CheckCircle className="h-5 w-5" />,
      });
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      
      if (apiError.details?.field) {
        setError(apiError.details.field as keyof ResetPasswordFormData, {
          type: 'manual',
          message: apiError.details.message || apiError.message,
        });
      } else {
        toast.error(apiError.message || 'Password reset failed. Please try again.', {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset. Redirecting to login...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <AutoSEO />
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!tokenFromUrl && (
              <Input
                label="Reset Token"
                icon={<Key className="h-5 w-5" />}
                placeholder="Enter reset token"
                error={errors.token?.message}
                {...register('token', {
                  required: {
                    value: true,
                    message: getErrorMessage(ValidationErrorCode.TOKEN_REQUIRED),
                  },
                  onBlur: () => trigger('token'),
                })}
              />
            )}

            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              showStrengthIndicator
              showRequirements
              error={errors.password?.message}
              {...register('password', {
                required: {
                  value: true,
                  message: getErrorMessage(ValidationErrorCode.PASSWORD_REQUIRED),
                },
                validate: async (value) => {
                  const result = validationManager.validatePassword(value);
                  if (!result.valid) {
                    return result.errors.join(', ') || getErrorMessage(ValidationErrorCode.PASSWORD_REQUIRED);
                  }
                  return true;
                },
                onBlur: () => {
                  trigger('password');
                  trigger('confirmPassword');
                },
              })}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: {
                  value: true,
                  message: getErrorMessage(ValidationErrorCode.PASSWORD_CONFIRM_REQUIRED),
                },
                validate: async (value) => {
                  const result = validationManager.validatePasswordMatch(password, value);
                  if (!result.valid) {
                    return result.error || getErrorMessage(result.errorCode || ValidationErrorCode.PASSWORD_DOES_NOT_MATCH);
                  }
                  return true;
                },
                onBlur: () => trigger('confirmPassword'),
              })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              icon={<CheckCircle className="h-5 w-5" />}
              isLoading={isLoading}
            >
              Reset Password
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

