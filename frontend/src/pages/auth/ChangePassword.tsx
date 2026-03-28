import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, X, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { validationManager } from '@/utils/validation';
import { ValidationErrorCode, getErrorMessage } from '@/utils/errorCodes';
import { ROUTES } from '@/utils/constants';
import { apiClient, API_ENDPOINTS } from '@/api/client';
import type { ApiError, ChangePasswordResponse } from '@/api/types';
import { AutoSEO } from '@/components/seo/SEO';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    clearErrors,
    setError,
  } = useForm<ChangePasswordFormData>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    clearErrors();

    const fieldsToValidate = ['currentPassword', 'newPassword', 'confirmPassword'] as const;
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

    const validation = validationManager.validateChangePasswordForm(
      data.currentPassword,
      data.newPassword,
      data.confirmPassword
    );

    if (!validation.valid && validation.fieldErrors) {
      Object.entries(validation.fieldErrors).forEach(([field, error]) => {
        setError(field as keyof ChangePasswordFormData, {
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
      await apiClient.post<ChangePasswordResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success('Password changed successfully!', {
        icon: <CheckCircle className="h-5 w-5" />,
      });
      navigate(ROUTES.PROFILE);
    } catch (error: unknown) {
      const apiError = error as ApiError;

      if (apiError.details?.field) {
        setError(apiError.details.field as keyof ChangePasswordFormData, {
          type: 'manual',
          message: apiError.details.message || apiError.message,
        });
      } else {
        toast.error(apiError.message || 'Password change failed. Please try again.', {
          icon: <XCircle className="h-5 w-5" />,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AutoSEO />
      <div className="max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--foreground)]">Change Password</h1>
              <p className="mt-2 text-[var(--foreground-muted)]">Update your password to keep your account secure.</p>
            </div>

            <div className="glass-card p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <PasswordInput
                  label="Current Password"
                  placeholder="Enter your current password"
                  error={errors.currentPassword?.message}
                  {...register('currentPassword', {
                    required: {
                      value: true,
                      message: getErrorMessage(ValidationErrorCode.PASSWORD_REQUIRED),
                    },
                    onBlur: () => trigger('currentPassword'),
                  })}
                />

                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  showStrengthIndicator
                  showRequirements
                  error={errors.newPassword?.message}
                  {...register('newPassword', {
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
                      trigger('newPassword');
                      trigger('confirmPassword');
                    },
                  })}
                />

                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: {
                      value: true,
                      message: getErrorMessage(ValidationErrorCode.PASSWORD_CONFIRM_REQUIRED),
                    },
                    validate: async (value) => {
                      const result = validationManager.validatePasswordMatch(newPassword, value);
                      if (!result.valid) {
                        return result.error || getErrorMessage(result.errorCode || ValidationErrorCode.PASSWORD_DOES_NOT_MATCH);
                      }
                      return true;
                    },
                    onBlur: () => trigger('confirmPassword'),
                  })}
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<Save className="h-5 w-5" />}
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    icon={<X className="h-5 w-5" />}
                    onClick={() => navigate(ROUTES.PROFILE)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
      </div>
    </>
  );
};
