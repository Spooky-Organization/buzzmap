import { User, Mail, Shield, Settings, Edit, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ROUTES } from '@/utils/constants';
import { SessionManager } from '@/auth/sessionManager';
import { AutoSEO } from '@/components/seo/SEO';

export const Profile = () => {
  // Get user data from SessionManager
  const sessionManager = SessionManager.getInstance();
  const sessionUser = sessionManager.getUser();
  
  const user = sessionUser ? {
    name: `${sessionUser.firstName} ${sessionUser.lastName}`,
    email: sessionUser.email,
    firstName: sessionUser.firstName,
    lastName: sessionUser.lastName,
    role: sessionUser.role,
    isEmailVerified: sessionUser.isEmailVerified,
    createdAt: sessionUser.createdAt || new Date().toISOString(),
    mfaEnabled: false, // TODO: Get from API when MFA status endpoint is available
  } : {
    name: 'Guest',
    email: '',
    firstName: '',
    lastName: '',
    role: 'USER' as const,
    isEmailVerified: false,
    createdAt: new Date().toISOString(),
    mfaEnabled: false,
  };

  return (
    <>
      <AutoSEO />
      <DashboardLayout>
      <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="mt-2 text-gray-600">Manage your account information and security settings.</p>
            </div>

            <div className="space-y-6">
              {/* Profile Header */}
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Personal Information */}
              <Card variant="default" padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <Button variant="ghost" size="sm" icon={<Edit className="h-4 w-4" />}>
                    Edit
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">First Name</label>
                    <p className="mt-1 text-gray-900">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                    <p className="mt-1 text-gray-900">{user.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="mt-1 text-gray-900">{user.email}</p>
                    {user.isEmailVerified ? (
                      <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </Card>

              {/* Security */}
              <Card variant="default" padding="lg">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Security</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">
                        {user.mfaEnabled ? 'Enabled' : 'Not enabled'}
                      </p>
                    </div>
                    <Link to={ROUTES.MFA_SETUP}>
                      <Button variant="secondary" size="sm">
                        {user.mfaEnabled ? 'Manage' : 'Enable'}
                      </Button>
                    </Link>
                  </div>
                  <Link to={ROUTES.CHANGE_PASSWORD}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Change Password</p>
                          <p className="text-sm text-gray-600">Update your password regularly</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>

              {/* Account Settings */}
              <Card variant="default" padding="lg">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Account Settings</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account Created</label>
                    <p className="mt-1 text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
    </DashboardLayout>
    </>
  );
};

