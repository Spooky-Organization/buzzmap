import { User, Mail, Shield, Settings, Edit, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
      <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--foreground)]">Profile Settings</h1>
              <p className="mt-2 text-[var(--foreground-muted)]">Manage your account information and security settings.</p>
            </div>

            <div className="space-y-6">
              {/* Profile Header */}
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[var(--foreground)]">{user.name}</h2>
                    <p className="text-[var(--foreground-muted)]">{user.email}</p>
                    <div className="mt-2">
                      <Badge variant={user.role.toLowerCase() as 'admin' | 'accountant' | 'user'}>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Personal Information */}
              <Card variant="default" padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[var(--foreground-muted)]" />
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">Personal Information</h3>
                  </div>
                  <Button variant="ghost" size="sm" icon={<Edit className="h-4 w-4" />}>
                    Edit
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--foreground-muted)]">First Name</label>
                    <p className="mt-1 text-[var(--foreground)]">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--foreground-muted)]">Last Name</label>
                    <p className="mt-1 text-[var(--foreground)]">{user.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--foreground-muted)] flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="mt-1 text-[var(--foreground)]">{user.email}</p>
                    {user.isEmailVerified ? (
                      <Badge variant="verified" className="mt-2">Verified</Badge>
                    ) : (
                      <Badge variant="unverified" className="mt-2">Unverified</Badge>
                    )}
                  </div>
                </div>
              </Card>

              {/* Security */}
              <Card variant="default" padding="lg">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="h-5 w-5 text-[var(--foreground-muted)]" />
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">Security</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[var(--glass-bg)] rounded-lg">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">Two-Factor Authentication</p>
                      <p className="text-sm text-[var(--foreground-muted)]">
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
                    <div className="flex items-center justify-between p-4 bg-[var(--glass-bg)] rounded-lg hover:bg-[var(--card-hover)] transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-[var(--foreground-muted)]" />
                        <div>
                          <p className="font-medium text-[var(--foreground)]">Change Password</p>
                          <p className="text-sm text-[var(--foreground-muted)]">Update your password regularly</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>

              {/* Account Settings */}
              <Card variant="default" padding="lg">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="h-5 w-5 text-[var(--foreground-muted)]" />
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">Account Settings</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--foreground-muted)]">Account Created</label>
                    <p className="mt-1 text-[var(--foreground)]">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
    </>
  );
};
