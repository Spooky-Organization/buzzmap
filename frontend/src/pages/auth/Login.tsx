import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, LogIn, Key, UserPlus, Shield } from 'lucide-react';
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
    <div className="min-h-screen flex bg-gray-900">
      <AutoSEO />
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-40 w-[400px] h-[400px] bg-white/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-secondary-500/30 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DashLabs</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back to DashLabs
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Sign in to access your dashboard and continue building amazing applications with enterprise-grade security.
          </p>

          <div className="space-y-4">
            {[
              'JWT Authentication with automatic refresh',
              'Multi-Factor Authentication (MFA)',
              'Role-Based Access Control (RBAC)',
              'Real-time notifications with SSE',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © {new Date().getFullYear()} DashLabs. Built by SpookieLabsInc.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DashLabs</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Sign in to your account</h2>
            <p className="text-gray-400 text-sm">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <Card variant="elevated" padding="lg" className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email address"
                labelClass="text-gray-300"
                type="email"
                icon={<Mail className="h-5 w-5" />}
                placeholder="you@example.com"
                error={errors.email?.message}
                className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500"
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
                labelClass="text-gray-300"
                placeholder="Enter your password"
                error={errors.password?.message}
                className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500"
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
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 bg-gray-900 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-400">Remember me</span>
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

              <p className="mt-6 text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <Link
                  to={ROUTES.REGISTER}
                  className="font-medium text-primary-400 hover:text-primary-300 flex items-center justify-center gap-1"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign up
                </Link>
              </p>

              <div className="pt-4 border-t border-gray-700">
                <Link to={ROUTES.HOME}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    Back to Home
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
