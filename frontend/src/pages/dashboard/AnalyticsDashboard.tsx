import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Eye,
  MousePointerClick,
  Info,
  LineChart,
  PieChart,
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const AnalyticsDashboard = () => {
  // Mock data for Analytics Dashboard
  const overviewStats = [
    {
      label: 'Total Page Views',
      value: '124,567',
      change: '+12.5%',
      trend: 'up',
      icon: <Eye className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Unique Visitors',
      value: '45,892',
      change: '+8.3%',
      trend: 'up',
      icon: <Users className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Click-Through Rate',
      value: '3.42%',
      change: '+0.8%',
      trend: 'up',
      icon: <MousePointerClick className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Revenue',
      value: '$89,234',
      change: '-2.1%',
      trend: 'down',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const trafficSources = [
    { source: 'Organic Search', visitors: 45230, percentage: 45, color: 'bg-blue-500' },
    { source: 'Direct', visitors: 28940, percentage: 29, color: 'bg-green-500' },
    { source: 'Social Media', visitors: 15680, percentage: 16, color: 'bg-purple-500' },
    { source: 'Referral', visitors: 10250, percentage: 10, color: 'bg-orange-500' },
  ];

  const topPages = [
    { page: '/dashboard', views: 12450, change: '+12%', trend: 'up' },
    { page: '/profile', views: 8920, change: '+8%', trend: 'up' },
    { page: '/admin/users', views: 6540, change: '+5%', trend: 'up' },
    { page: '/settings', views: 4320, change: '-3%', trend: 'down' },
    { page: '/login', views: 3890, change: '+15%', trend: 'up' },
  ];

  const deviceBreakdown = [
    { device: 'Desktop', users: 45230, percentage: 52, color: 'bg-blue-500' },
    { device: 'Mobile', users: 34210, percentage: 39, color: 'bg-green-500' },
    { device: 'Tablet', users: 8560, percentage: 9, color: 'bg-purple-500' },
  ];

  const timeSeriesData = [
    { date: 'Mon', value: 1240 },
    { date: 'Tue', value: 1890 },
    { date: 'Wed', value: 2100 },
    { date: 'Thu', value: 1980 },
    { date: 'Fri', value: 2340 },
    { date: 'Sat', value: 1890 },
    { date: 'Sun', value: 1650 },
  ];

  const maxValue = Math.max(...timeSeriesData.map(d => d.value));

  return (
    <DashboardLayout>
      <div className="container-custom max-w-7xl">
        {/* Disclaimer Banner */}
        <Card variant="default" padding="md" className="mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                Sample/Mock Analytics Dashboard
              </p>
              <p className="text-xs text-yellow-800 mt-1">
                This is a mock analytics dashboard page with sample data to demonstrate analytics and reporting functionality. 
                All statistics, charts, and metrics shown here are for demonstration purposes only.
              </p>
            </div>
          </div>
        </Card>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analytics and insights for your application
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => (
            <Card key={index} variant="elevated" padding="md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Over Time */}
          <Card variant="elevated" padding="lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary-600" />
                Traffic Over Time
              </h2>
              <p className="text-sm text-gray-600 mt-1">Last 7 days</p>
            </div>
            <div className="flex items-end justify-between gap-2 h-64">
              {timeSeriesData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end h-full">
                    <div
                      className="w-full bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600"
                      style={{ height: `${(data.value / maxValue) * 100}%` }}
                      title={`${data.value} visitors`}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{data.date}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Traffic Sources */}
          <Card variant="elevated" padding="lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary-600" />
                Traffic Sources
              </h2>
              <p className="text-sm text-gray-600 mt-1">Visitor breakdown by source</p>
            </div>
            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{source.source}</span>
                    <span className="text-sm text-gray-600">{source.visitors.toLocaleString()} ({source.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${source.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Pages */}
          <Card variant="elevated" padding="lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-600" />
                Top Pages
              </h2>
              <p className="text-sm text-gray-600 mt-1">Most visited pages this week</p>
            </div>
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{page.page}</p>
                    <p className="text-xs text-gray-600">{page.views.toLocaleString()} views</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {page.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      page.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {page.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Device Breakdown */}
          <Card variant="elevated" padding="lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                Device Breakdown
              </h2>
              <p className="text-sm text-gray-600 mt-1">Users by device type</p>
            </div>
            <div className="space-y-4">
              {deviceBreakdown.map((device, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{device.device}</span>
                    <span className="text-sm text-gray-600">{device.users.toLocaleString()} ({device.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${device.color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

