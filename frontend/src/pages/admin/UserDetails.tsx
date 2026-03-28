import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Edit,
  Save,
  X,
  Trash2,
  MailCheck,
  Key,
  UserCog,
  Clock,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AutoSEO } from '@/components/seo/SEO';
import { type UserRole } from '@/utils/constants';
import { validationManager } from '@/utils/validation';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  mfaEnabled: boolean;
}

export const UserDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const [isEdit, setIsEdit] = useState(isEditMode);
  const [isLoading, setIsLoading] = useState(false);


  // Placeholder user data (in real app, fetch from API)
  const [userData, setUserData] = useState<UserData>({
    id: id || '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'USER',
    isEmailVerified: true,
    createdAt: '2024-01-15',
    lastLogin: '2 days ago',
    mfaEnabled: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserData>({
    defaultValues: userData,
  });

  useEffect(() => {
    reset(userData);
  }, [userData, reset]);

  const onSubmit = async (data: UserData) => {
    setIsLoading(true);

    // Validate email
    const emailValidation = validationManager.validateEmail(data.email);
    if (!emailValidation.valid) {
      toast.error(emailValidation.error || 'Invalid email', {
        icon: <CheckCircle className="h-5 w-5" />,
      });
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setUserData(data);
      setIsEdit(false);
      setIsLoading(false);
      toast.success('User updated successfully!', {
        icon: <CheckCircle className="h-5 w-5" />,
      });
    }, 1000);
  };

  const handleCancel = () => {
    reset(userData);
    setIsEdit(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${userData.firstName} ${userData.lastName}?`)) {
      toast.success('User deleted successfully', {
        icon: <CheckCircle className="h-5 w-5" />,
      });
      navigate('/admin/users');
    }
  };

  const handleResendVerification = () => {
    toast.success('Verification email sent!', {
      icon: <CheckCircle className="h-5 w-5" />,
    });
  };

  const handleResetPassword = () => {
    toast.success('Password reset email sent!', {
      icon: <CheckCircle className="h-5 w-5" />,
    });
  };

  return (
    <>
      <AutoSEO />
      <div className="max-w-4xl">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link
                to="/admin/users"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Users
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
                <UserCog className="h-8 w-8 text-primary-600" />
                User Details
              </h1>
            </div>

            {/* Disclaimer Banner */}
            <Card variant="default" padding="md" className="mb-6 bg-amber-500/10 border-amber-500/20">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Sample/Mock User Details Page
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    This is a mock user details page with sample/placeholder data to demonstrate user detail management functionality.
                    All user information, activity logs, and operations shown here are for demonstration purposes only.
                  </p>
                </div>
              </div>
            </Card>

            {/* User Info Card */}
            <Card variant="elevated" padding="lg" className="mb-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-[var(--foreground)]">
                      {userData.firstName} {userData.lastName}
                    </h2>
                    <Badge variant={userData.role.toLowerCase() as 'admin' | 'accountant' | 'user'}>
                      {userData.role}
                    </Badge>
                  </div>
                  <p className="text-[var(--foreground-muted)] mb-4">{userData.email}</p>
                  <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Created: {new Date(userData.createdAt).toLocaleDateString()}
                    </div>
                    {userData.lastLogin && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Last login: {userData.lastLogin}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Edit Form */}
            <Card variant="elevated" padding="lg" className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[var(--foreground-muted)]" />
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">User Information</h3>
                </div>
                {!isEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit className="h-4 w-4" />}
                    onClick={() => setIsEdit(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    icon={<User className="h-5 w-5" />}
                    disabled={!isEdit}
                    error={errors.firstName?.message}
                    {...register('firstName', {
                      required: 'First name is required',
                      validate: (value) => {
                        const result = validationManager.validateName(value);
                        return result.valid || result.error;
                      },
                    })}
                  />

                  <Input
                    label="Last Name"
                    icon={<User className="h-5 w-5" />}
                    disabled={!isEdit}
                    error={errors.lastName?.message}
                    {...register('lastName', {
                      required: 'Last name is required',
                      validate: (value) => {
                        const result = validationManager.validateName(value);
                        return result.valid || result.error;
                      },
                    })}
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  icon={<Mail className="h-5 w-5" />}
                  disabled={!isEdit}
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    validate: (value) => {
                      const result = validationManager.validateEmail(value);
                      return result.valid || result.error;
                    },
                  })}
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Role</label>
                  <select
                    {...register('role')}
                    disabled={!isEdit}
                    className="w-full px-4 py-2 glass-input disabled:opacity-50"
                  >
                    <option value="USER">User</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {isEdit && (
                  <div className="flex items-center gap-3 pt-4 border-t border-[var(--glass-border)]">
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
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </Card>

            {/* Status Card */}
            <Card variant="default" padding="lg" className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-[var(--foreground-muted)]" />
                <h3 className="text-xl font-semibold text-[var(--foreground)]">Account Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--foreground-muted)]">Email Verification</span>
                  {userData.isEmailVerified ? (
                    <Badge variant="verified">Verified</Badge>
                  ) : (
                    <Badge variant="unverified">Unverified</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--foreground-muted)]">Two-Factor Authentication</span>
                  {userData.mfaEnabled ? (
                    <Badge variant="success">Enabled</Badge>
                  ) : (
                    <Badge variant="default">Disabled</Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Actions Card */}
            <Card variant="default" padding="lg" className="mb-6">
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  icon={<MailCheck className="h-5 w-5" />}
                  onClick={handleResendVerification}
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
                <Button
                  variant="secondary"
                  icon={<Key className="h-5 w-5" />}
                  onClick={handleResetPassword}
                  className="w-full"
                >
                  Reset Password
                </Button>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">Danger Zone</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Once you delete a user, there is no going back. Please be certain.
                  </p>
                </div>
                <Button
                  variant="danger"
                  icon={<Trash2 className="h-5 w-5" />}
                  onClick={handleDelete}
                >
                  Delete User
                </Button>
              </div>
            </Card>
      </div>
    </>
  );
};
