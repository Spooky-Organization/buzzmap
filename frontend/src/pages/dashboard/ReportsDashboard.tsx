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
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'This Month',
      value: '12',
      change: '+3',
      trend: 'up',
      icon: <Calendar className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Generated',
      value: '45',
      change: '+8',
      trend: 'up',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Pending',
      value: '3',
      change: '-1',
      trend: 'down',
      icon: <PieChart className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
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
      <DashboardLayout>
      <div className="space-y-6">
        {/* Disclaimer Banner */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Mock Data Disclaimer
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                This page displays mock/sample report data for demonstration purposes only. 
                All report information shown here is simulated and not connected to any real reporting system.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Generate and manage financial reports</p>
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
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
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
            <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">ID: {report.id}</span>
                      <span className="text-sm text-gray-600">Type: {report.type}</span>
                      <span className="text-sm text-gray-600">Date: {report.generatedDate}</span>
                      <span className="text-sm text-gray-600">Size: {report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
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
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Financial Report</h3>
                <p className="text-sm text-gray-600 mt-1">Generate comprehensive financial analysis</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <LineChart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Trend Analysis</h3>
                <p className="text-sm text-gray-600 mt-1">View trends and patterns</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Custom Report</h3>
                <p className="text-sm text-gray-600 mt-1">Create a custom report</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
    </>
  );
};

