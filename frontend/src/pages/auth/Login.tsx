import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, LogIn, Key, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { validationManager } from '@/utils/validation';
import { ValidationErrorCode, getErrorMessage } from '@/utils/errorCodes';
import { ROUTES } from '@/utils/constants';
import { SessionManager } from '@/auth/sessionManager';
import type { ApiError } from '@/api/types';
import { AutoSEO } from '@/components/seo/SEO';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    trigger,
  } = useForm<LoginFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    const emailValid = await trigger('email');
    const passwordValid = await trigger('password');

    if (!emailValid || !passwordValid) {
      setIsLoading(false);
      toast.error('Please fix the errors in the form', {
        icon: <XCircle className="h-5 w-5" />,
      });
      return;
    }

    const validation = validationManager.validateLoginForm(data.email, data.password);
    if (!validation.valid && validation.fieldErrors) {
      Object.entries(validation.fieldErrors).forEach(([field, error]) => {
        setError(field as keyof LoginFormData, {
          type: 'manual',
          message: error.message,
        });
      });
      setIsLoading(false);
      toast.error('Please check your input', {
        icon: <XCircle className="h-5 w-5" />,
      });
      return;
    }

    try {
      const sessionManager = SessionManager.getInstance();
      const response = await sessionManager.login(data.email, data.password);

      if (response.mfaRequired) {
        toast.info('MFA verification required', {
          icon: <Key className="h-5 w-5" />,
        });
        navigate(ROUTES.MFA_LOGIN, { state: { email: data.email } });
        return;
      }

      toast.success('Login successful!', {
        icon: <CheckCircle className="h-5 w-5" />,
      });
      navigate(ROUTES.DASHBOARD);
    } catch (error: unknown) {
      const apiError = error as ApiError;

      if (apiError.details?.field) {
        setError(apiError.details.field as keyof LoginFormData, {
          type: 'manual',
          message: apiError.details.message || apiError.message,
        });
      } else {
        toast.error(apiError.message || 'Login failed. Please try again.', {
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
      <AuthLayout title="Sign in to your account" subtitle="Enter your credentials to access your dashboard">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            icon={<Mail className="h-5 w-5" />}
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: {
                value: true,
                message: getErrorMessage(ValidationErrorCode.LOGIN_EMAIL_REQUIRED),
              },
              validate: (value) => {
                if (!value || value.trim() === '') {
                  return getErrorMessage(ValidationErrorCode.LOGIN_EMAIL_REQUIRED);
                }
                const result = validationManager.validateEmail(value);
                if (!result.valid) {
                  return result.error || getErrorMessage(result.errorCode || ValidationErrorCode.EMAIL_INVALID);
                }
                return true;
              },
            })}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password', {
              required: {
                value: true,
                message: getErrorMessage(ValidationErrorCode.LOGIN_PASSWORD_REQUIRED),
              },
              validate: (value) => {
                if (!value || value.trim() === '') {
                  return getErrorMessage(ValidationErrorCode.LOGIN_PASSWORD_REQUIRED);
                }
                return true;
              },
            })}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 rounded border-[var(--input-border)] bg-[var(--input-bg)]"
              />
              <span className="ml-2 text-sm text-[var(--foreground-muted)]">Remember me</span>
            </label>

            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              <Key className="h-4 w-4" />
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            icon={<LogIn className="h-5 w-5" />}
            isLoading={isLoading}
          >
            Sign in
          </Button>

          <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
            Don't have an account?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-medium text-primary-400 hover:text-primary-300 flex items-center justify-center gap-1"
            >
              <UserPlus className="h-4 w-4" />
              Sign up
            </Link>
          </p>

          <div className="pt-4 border-t border-[var(--glass-border)]">
            <Link to={ROUTES.HOME}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </form>
      </AuthLayout>
    </>
  );
};
