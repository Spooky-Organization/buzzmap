import {
  FileText,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AutoSEO } from '@/components/seo/SEO';

export const ReportsDashboard = () => {
  // Mock data for Reports Dashboard
  const reportStats = [
    {
      label: 'Total Reports',
      value: '48',
      change: '+12',
      trend: 'up',
      icon: <FileText className="h-6 w-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'This Month',
      value: '12',
      change: '+3',
      trend: 'up',
      icon: <Calendar className="h-6 w-6" />,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
    {
      label: 'Generated',
      value: '45',
      change: '+8',
      trend: 'up',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Pending',
      value: '3',
      change: '-1',
      trend: 'down',
      icon: <PieChart className="h-6 w-6" />,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  const recentReports = [
    {
      id: 'RPT-001',
      title: 'Monthly Financial Summary',
      type: 'Financial',
      generatedDate: '2025-01-15',
      status: 'completed',
      size: '2.4 MB',
    },
    {
      id: 'RPT-002',
      title: 'Transaction Analysis Q4',
      type: 'Analysis',
      generatedDate: '2025-01-14',
      status: 'completed',
      size: '1.8 MB',
    },
    {
      id: 'RPT-003',
      title: 'Revenue Report',
      type: 'Revenue',
      generatedDate: '2025-01-13',
      status: 'pending',
      size: '-',
    },
    {
      id: 'RPT-004',
      title: 'Expense Breakdown',
      type: 'Expense',
      generatedDate: '2025-01-12',
      status: 'completed',
      size: '3.1 MB',
    },
    {
      id: 'RPT-005',
      title: 'Annual Summary Report',
      type: 'Summary',
      generatedDate: '2025-01-10',
      status: 'completed',
      size: '5.2 MB',
    },
  ];

  return (
    <>
      <AutoSEO />
      <div className="space-y-6">
        {/* Disclaimer Banner */}
        <div className="bg-amber-500/10 border-l-4 border-amber-500/20 p-4 rounded-md">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-[var(--foreground)]">
                Mock Data Disclaimer
              </h3>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                This page displays mock/sample report data for demonstration purposes only.
                All report information shown here is simulated and not connected to any real reporting system.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Reports</h1>
            <p className="text-[var(--foreground-muted)] mt-1">Generate and manage financial reports</p>
          </div>
          <Button className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportStats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground-muted)]">{stat.label}</p>
                  <p className="text-2xl font-bold text-[var(--foreground)] mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-[var(--foreground-muted)] ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Recent Reports</h2>
            <button className="text-sm text-purple-400 hover:text-purple-300 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-[var(--glass-border)] rounded-lg hover:bg-[var(--card-hover)] transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-violet-500/10 p-3 rounded-lg">
                    <FileText className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">{report.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-[var(--foreground-muted)]">ID: {report.id}</span>
                      <span className="text-sm text-[var(--foreground-muted)]">Type: {report.type}</span>
                      <span className="text-sm text-[var(--foreground-muted)]">Date: {report.generatedDate}</span>
                      <span className="text-sm text-[var(--foreground-muted)]">Size: {report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={
                    report.status === 'completed' ? 'success' : 'warning'
                  }>
                    {report.status}
                  </Badge>
                  {report.status === 'completed' && (
                    <Button variant="secondary" size="sm" className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Financial Report</h3>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">Generate comprehensive financial analysis</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-500/10 p-3 rounded-lg">
                <LineChart className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Trend Analysis</h3>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">View trends and patterns</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="bg-violet-500/10 p-3 rounded-lg">
                <PieChart className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Custom Report</h3>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">Create a custom report</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
