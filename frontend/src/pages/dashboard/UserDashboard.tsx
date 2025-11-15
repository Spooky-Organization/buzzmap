import { 
  LogIn, 
  CheckCircle, 
  Clock, 
  Shield, 
  User, 
  Activity,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SessionManager } from '@/auth/sessionManager';
import { AutoSEO } from '@/components/seo/SEO';

export const UserDashboard = () => {
  const sessionManager = SessionManager.getInstance();
  const sessionUser = sessionManager.getUser();
  
  const user = sessionUser ? {
    name: `${sessionUser.firstName} ${sessionUser.lastName}`,
    email: sessionUser.email,
    role: sessionUser.role,
  } : {
    name: 'Guest',
    email: '',
    role: 'USER' as const,
  };

  // Mock data for User Dashboard
  const stats = [
    {
      label: 'Total Logins',
      value: '127',
      change: '+12%',
      trend: 'up',
      icon: <LogIn className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Account Status',
      value: 'Active',
      change: 'Verified',
      trend: 'stable',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Last Login',
      value: '2 days ago',
      change: 'Recent',
      trend: 'stable',
      icon: <Clock className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Security Score',
      value: '85%',
      change: '+5%',
      trend: 'up',
      icon: <Shield className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const recentActivity = [
    { 
      action: 'Password changed', 
      time: '2 hours ago', 
      icon: <Shield className="h-4 w-4" />,
      type: 'security'
    },
    { 
      action: 'Profile updated', 
      time: '1 day ago', 
      icon: <User className="h-4 w-4" />,
      type: 'profile'
    },
    { 
      action: 'Login successful', 
      time: '2 days ago', 
      icon: <LogIn className="h-4 w-4" />,
      type: 'login'
    },
    { 
      action: 'Email verified', 
      time: '3 days ago', 
      icon: <CheckCircle className="h-4 w-4" />,
      type: 'verification'
    },
  ];


  return (
    <>
      <AutoSEO />
    <DashboardLayout>
            {/* Disclaimer Banner */}
            <Card variant="default" padding="md" className="mb-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">
                    Sample/Mock Dashboard
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    This is a mock dashboard page with sample data to demonstrate role-based UI implementation. 
                    All statistics and activities shown here are for demonstration purposes only.
                  </p>
                </div>
              </div>
            </Card>

            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Here's what's happening with your account today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} variant="elevated" padding="lg" className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <div className={stat.color}>{stat.icon}</div>
                    </div>
                    {stat.trend === 'up' && (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                    {stat.trend !== 'up' && (
                      <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card variant="elevated" padding="lg" className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-gray-400">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                      {activity.type}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Security Recommendations */}
            <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-primary-50 to-purple-50">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Shield className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Security Recommendations
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Keep your account secure with these quick tips:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Enable two-factor authentication for extra security
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Update your password regularly
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Review your recent login activity
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
    </DashboardLayout>
    </>
  );
};

