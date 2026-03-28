import {
  Users,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle,
  BarChart3,
  UserCheck,
  Info,
  Server
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/utils/constants';
import { SessionManager } from '@/auth/sessionManager';
import { AutoSEO } from '@/components/seo/SEO';

export const AdminDashboard = () => {
  const sessionManager = SessionManager.getInstance();
  const sessionUser = sessionManager.getUser();

  const user = sessionUser ? {
    name: `${sessionUser.firstName} ${sessionUser.lastName}`,
    email: sessionUser.email,
    role: sessionUser.role,
  } : {
    name: 'Guest',
    email: '',
    role: 'ADMIN' as const,
  };

  // Mock data for Admin Dashboard
  const stats = [
    {
      label: 'Total Users',
      value: '1,247',
      change: '+127',
      trend: 'up',
      icon: <Users className="h-6 w-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Active Sessions',
      value: '342',
      change: '+23',
      trend: 'up',
      icon: <Activity className="h-6 w-6" />,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'System Health',
      value: '98.5%',
      change: 'Excellent',
      trend: 'stable',
      icon: <Server className="h-6 w-6" />,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
    {
      label: 'Pending Actions',
      value: '12',
      change: '-3',
      trend: 'down',
      icon: <AlertCircle className="h-6 w-6" />,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  const userStats = [
    { role: 'USER', count: 1024, percentage: 82, color: 'bg-blue-500' },
    { role: 'ACCOUNTANT', count: 156, percentage: 13, color: 'bg-green-500' },
    { role: 'ADMIN', count: 67, percentage: 5, color: 'bg-purple-500' },
  ];

  const recentActivity = [
    {
      action: 'New user registered',
      user: 'john.doe@example.com',
      time: '5 minutes ago',
      icon: <UserCheck className="h-4 w-4" />,
      type: 'user'
    },
    {
      action: 'Role updated',
      user: 'jane.smith@example.com',
      time: '1 hour ago',
      icon: <Shield className="h-4 w-4" />,
      type: 'security'
    },
    {
      action: 'System backup completed',
      user: 'System',
      time: '2 hours ago',
      icon: <CheckCircle className="h-4 w-4" />,
      type: 'system'
    },
    {
      action: 'Failed login attempt',
      user: 'unknown@example.com',
      time: '3 hours ago',
      icon: <AlertCircle className="h-4 w-4" />,
      type: 'security'
    },
  ];

  const systemAlerts = [
    {
      title: 'High API Usage',
      message: 'API requests exceeded 10K in the last hour',
      severity: 'warning',
      time: '15 minutes ago'
    },
    {
      title: 'Database Optimization',
      message: 'Scheduled maintenance completed successfully',
      severity: 'info',
      time: '2 hours ago'
    },
  ];

  return (
    <>
      <AutoSEO />
            {/* Disclaimer Banner */}
            <Card variant="default" padding="md" className="mb-6 bg-amber-500/10 border-amber-500/20">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Sample/Mock Admin Dashboard
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    This is a mock dashboard page with sample data to demonstrate role-based UI implementation for Admin role.
                    All user statistics, system metrics, and activity logs shown here are for demonstration purposes only.
                  </p>
                </div>
              </div>
            </Card>

            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
                Admin Dashboard
              </h1>
              <p className="text-[var(--foreground-muted)] text-lg">
                Welcome back, {user.name.split(' ')[0]}! Here's your system overview.
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
                    <Badge variant={
                      stat.trend === 'up'
                        ? 'positive'
                        : stat.trend === 'down'
                        ? 'negative'
                        : 'neutral'
                    }>
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground-muted)] mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">{stat.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* User Distribution - Takes 1 column */}
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">User Distribution</h2>
                </div>
                <div className="space-y-4">
                  {userStats.map((stat, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--foreground)]">{stat.role}</span>
                        <span className="text-sm font-semibold text-[var(--foreground)]">{stat.count}</span>
                      </div>
                      <div className="w-full bg-[var(--glass-bg)] rounded-full h-2">
                        <div
                          className={`${stat.color} h-2 rounded-full transition-all`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-[var(--foreground-muted)] mt-1">{stat.percentage}% of total</p>
                    </div>
                  ))}
                </div>
                <Link to={ROUTES.ADMIN_USERS}>
                  <Button variant="secondary" className="w-full mt-6" size="sm">
                    Manage Users
                  </Button>
                </Link>
              </Card>

              {/* Recent Activity - Takes 2 columns */}
              <Card variant="elevated" padding="lg" className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary-600" />
                    <h2 className="text-xl font-semibold text-[var(--foreground)]">Recent Activity</h2>
                  </div>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg border border-[var(--glass-border)] hover:bg-[var(--card-hover)] transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'security'
                          ? 'bg-red-500/10'
                          : activity.type === 'system'
                          ? 'bg-violet-500/10'
                          : 'bg-blue-500/10'
                      }`}>
                        <div className={
                          activity.type === 'security'
                            ? 'text-red-400'
                            : activity.type === 'system'
                            ? 'text-violet-400'
                            : 'text-blue-400'
                        }>
                          {activity.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)]">{activity.action}</p>
                        <p className="text-xs text-[var(--foreground-muted)] mt-1">{activity.user}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          activity.type === 'security'
                            ? 'security'
                            : activity.type === 'system'
                            ? 'system'
                            : 'user'
                        }>
                          {activity.type}
                        </Badge>
                        <p className="text-xs text-[var(--foreground-muted)] mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* System Alerts */}
            <Card variant="elevated" padding="lg" className="bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                    System Alerts & Notifications
                  </h3>
                  <div className="space-y-3">
                    {systemAlerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          alert.severity === 'warning'
                            ? 'bg-amber-500/10 border-amber-500/20'
                            : 'bg-blue-500/10 border-blue-500/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--foreground)]">{alert.title}</p>
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">{alert.message}</p>
                          </div>
                          <span className="text-xs text-[var(--foreground-muted)]">{alert.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm">
                      View All Alerts
                    </Button>
                    <Link to={ROUTES.ADMIN_USERS}>
                      <Button variant="primary" size="sm">
                        System Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
    </>
  );
};
