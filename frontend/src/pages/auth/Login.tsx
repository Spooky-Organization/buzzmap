import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, LogIn, Key, UserPlus, Home } from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card } from '@/components/ui/Card';
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
    mode: 'onChange', // Validate on change
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    // Validate all fields
    const emailValid = await trigger('email');
    const passwordValid = await trigger('password');
    
    if (!emailValid || !passwordValid) {
      setIsLoading(false);
      toast.error('Please fix the errors in the form', {
        icon: <XCircle className="h-5 w-5" />,
      });
      return;
    }
    
    // Additional form-level validation
    const validation = validationManager.validateLoginForm(data.email, data.password);
    if (!validation.valid && validation.fieldErrors) {
      // Set field-specific errors
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

      // Check if MFA is required
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
      
      // Handle field-specific errors
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <AutoSEO />
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
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
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>

              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
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

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Sign up
              </Link>
            </p>

            <div className="pt-4 border-t border-gray-200">
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

