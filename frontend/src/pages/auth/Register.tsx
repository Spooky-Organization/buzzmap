import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type React from 'react';
import { Mail, UserPlus, User, LogIn, FileText, Shield, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
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

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    trigger,
  } = useForm<RegisterFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    const fieldsToValidate = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'] as const;
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

    const validation = validationManager.validateRegisterForm({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    if (!validation.valid && validation.fieldErrors) {
      Object.entries(validation.fieldErrors).forEach(([field, error]) => {
        setError(field as keyof RegisterFormData, {
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

    if (!data.acceptTerms) {
      setError('acceptTerms', {
        type: 'manual',
        message: getErrorMessage(ValidationErrorCode.REGISTER_TERMS_NOT_ACCEPTED),
      });
      setIsLoading(false);
      toast.error(getErrorMessage(ValidationErrorCode.REGISTER_TERMS_NOT_ACCEPTED), {
        icon: <XCircle className="h-5 w-5" />,
      });
      return;
    }

    try {
      const sessionManager = SessionManager.getInstance();
      await sessionManager.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      toast.success('Registration successful! Please check your email to verify your account.', {
        icon: <CheckCircle className="h-5 w-5" />,
      });
      navigate(ROUTES.VERIFY_EMAIL);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      
      if (apiError.statusCode === 409) {
        setError('email', {
          type: 'manual',
          message: apiError.message || 'This email is already registered',
        });
        toast.error(apiError.message || 'This email is already registered. Please use a different email or try logging in.', {
          icon: <XCircle className="h-5 w-5" />,
          duration: 5000,
        });
        return;
      }
      
      if (apiError.details?.field) {
        setError(apiError.details.field as keyof RegisterFormData, {
          type: 'manual',
          message: apiError.details.message || apiError.message,
        });
        toast.error(apiError.details.message || apiError.message, {
          icon: <XCircle className="h-5 w-5" />,
        });
      } else {
        toast.error(apiError.message || 'Registration failed. Please try again.', {
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary-600 via-secondary-700 to-primary-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -right-40 w-[400px] h-[400px] bg-white/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-primary-500/30 rounded-full blur-[120px]" />
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
            Join DashLabs Today
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Create your free account and start building secure, scalable applications with enterprise-grade features.
          </p>

          <div className="space-y-4">
            {[
              'Free tier with full features',
              'No credit card required',
              'Production-ready in minutes',
              'Open source MIT license',
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

      {/* Right Side - Register Form */}
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
            <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-gray-400 text-sm">
              Get started with your free account today
            </p>
          </div>

          <Card variant="elevated" padding="lg" className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  labelClass="text-gray-300"
                  icon={<User className="h-5 w-5" />}
                  placeholder="John"
                  error={errors.firstName?.message}
                  className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500"
                  {...register('firstName', {
                    required: {
                      value: true,
                      message: getErrorMessage(ValidationErrorCode.FIRST_NAME_REQUIRED),
                    },
                    validate: (value) => {
                      if (!value || value.trim() === '') {
                        return getErrorMessage(ValidationErrorCode.FIRST_NAME_REQUIRED);
                      }
                      const result = validationManager.validateName(value, 'First name');
                      if (!result.valid) {
                        return result.error || getErrorMessage(result.errorCode || ValidationErrorCode.FIRST_NAME_REQUIRED);
                      }
                      return true;
                    },
                  })}
                />

                <Input
                  label="Last Name"
                  labelClass="text-gray-300"
                  icon={<User className="h-5 w-5" />}
                  placeholder="Doe"
                  error={errors.lastName?.message}
                  className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500"
                  {...register('lastName', {
                    required: {
                      value: true,
                      message: getErrorMessage(ValidationErrorCode.LAST_NAME_REQUIRED),
                    },
                    validate: (value) => {
                      if (!value || value.trim() === '') {
                        return getErrorMessage(ValidationErrorCode.LAST_NAME_REQUIRED);
                      }
                      const result = validationManager.validateName(value, 'Last name');
                      if (!result.valid) {
                        return result.error || getErrorMessage(result.errorCode || ValidationErrorCode.LAST_NAME_REQUIRED);
                      }
                      return true;
                    },
                  })}
                />
              </div>

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
                    message: getErrorMessage(ValidationErrorCode.EMAIL_REQUIRED),
                  },
                  validate: (value) => {
                    if (!value || value.trim() === '') {
                      return getErrorMessage(ValidationErrorCode.EMAIL_REQUIRED);
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
                placeholder="Create a strong password"
                showStrengthIndicator={true}
                showRequirements={true}
                error={errors.password?.message}
                className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500"
                {...(register('password', {
                  required: {
                    value: true,
                    message: getErrorMessage(ValidationErrorCode.PASSWORD_REQUIRED),
                  },
                  validate: (value) => {
                    if (!value || value.trim() === '') {
                      return getErrorMessage(ValidationErrorCode.PASSWORD_REQUIRED);
                    }
                    const result = validationManager.validatePassword(value);
                    if (!result.valid) {
                      return result.errors.join(', ') || getErrorMessage(ValidationErrorCode.PASSWORD_REQUIRED);
                    }
                    return true;
                  },
                  onChange: () => {
                    trigger('confirmPassword');
                  },
                }) as React.ComponentPropsWithoutRef<'input'>)}
              />

              <PasswordInput
                label="Confirm Password"
                labelClass="text-gray-300"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500"
                {...register('confirmPassword', {
                  required: {
                    value: true,
                    message: getErrorMessage(ValidationErrorCode.PASSWORD_CONFIRM_REQUIRED),
                  },
                  validate: (value) => {
                    if (!value || value.trim() === '') {
                      return getErrorMessage(ValidationErrorCode.PASSWORD_CONFIRM_REQUIRED);
                    }
                    const result = validationManager.validatePasswordMatch(password, value);
                    if (!result.valid) {
                      return result.error || getErrorMessage(result.errorCode || ValidationErrorCode.PASSWORD_DOES_NOT_MATCH);
                    }
                    return true;
                  },
                })}
              />

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  {...register('acceptTerms', {
                    required: {
                      value: true,
                      message: getErrorMessage(ValidationErrorCode.REGISTER_TERMS_NOT_ACCEPTED),
                    },
                  })}
                  className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-600 bg-gray-900 rounded"
                />
                <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-400 flex items-start gap-1">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    I agree to the{' '}
                    <Link
                      to={ROUTES.TERMS}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      to={ROUTES.PRIVACY}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-400">{errors.acceptTerms.message}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                icon={<UserPlus className="h-5 w-5" />}
                isLoading={isLoading}
              >
                Create account
              </Button>

              <p className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link
                  to={ROUTES.LOGIN}
                  className="font-medium text-primary-400 hover:text-primary-300 flex items-center justify-center gap-1"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
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
