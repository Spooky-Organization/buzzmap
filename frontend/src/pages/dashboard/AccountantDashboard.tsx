import { 
  DollarSign, 
  Users, 
  FileText, 
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3,
  Receipt,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SessionManager } from '@/auth/sessionManager';
import { AutoSEO } from '@/components/seo/SEO';

export const AccountantDashboard = () => {
  const sessionManager = SessionManager.getInstance();
  const sessionUser = sessionManager.getUser();
  
  const user = sessionUser ? {
    name: `${sessionUser.firstName} ${sessionUser.lastName}`,
    email: sessionUser.email,
    role: sessionUser.role,
  } : {
    name: 'Guest',
    email: '',
    role: 'ACCOUNTANT' as const,
  };

  // Mock data for Accountant Dashboard
  const stats = [
    {
      label: 'Total Transactions',
      value: '1,247',
      change: '+18%',
      trend: 'up',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Pending Reviews',
      value: '23',
      change: '-5',
      trend: 'down',
      icon: <FileText className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Users Managed',
      value: '156',
      change: '+12',
      trend: 'up',
      icon: <Users className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Monthly Revenue',
      value: '$45.2K',
      change: '+8.5%',
      trend: 'up',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const recentTransactions = [
    { 
      id: 'TXN-001',
      description: 'Invoice Payment - Client A',
      amount: '$2,500.00',
      status: 'completed',
      date: '2 hours ago',
      type: 'income'
    },
    { 
      id: 'TXN-002',
      description: 'Expense Report - Office Supplies',
      amount: '$450.00',
      status: 'pending',
      date: '5 hours ago',
      type: 'expense'
    },
    { 
      id: 'TXN-003',
      description: 'Invoice Payment - Client B',
      amount: '$1,800.00',
      status: 'completed',
      date: '1 day ago',
      type: 'income'
    },
    { 
      id: 'TXN-004',
      description: 'Refund Processing',
      amount: '$320.00',
      status: 'pending',
      date: '2 days ago',
      type: 'refund'
    },
  ];

  const pendingTasks = [
    { task: 'Review Q4 Financial Report', priority: 'high', dueDate: 'Today' },
    { task: 'Approve Expense Claims', priority: 'medium', dueDate: 'Tomorrow' },
    { task: 'Update User Billing Information', priority: 'low', dueDate: 'This Week' },
  ];

  return (
    <>
      <AutoSEO />
            {/* Disclaimer Banner */}
            <Card variant="default" padding="md" className="mb-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">
                    Sample/Mock Accountant Dashboard
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    This is a mock dashboard page with sample data to demonstrate role-based UI implementation for Accountant role. 
                    All financial data, transactions, and statistics shown here are for demonstration purposes only.
                  </p>
                </div>
              </div>
            </Card>

            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Accountant Dashboard 📊
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome back, {user.name.split(' ')[0]}! Here's your financial overview.
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
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.trend === 'up' 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-red-600 bg-red-100'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Recent Transactions - Takes 2 columns */}
              <Card variant="elevated" padding="lg" className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                  </div>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100' 
                            : 'bg-yellow-100'
                        }`}>
                          {transaction.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{transaction.id}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                              {transaction.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{transaction.amount}</p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pending Tasks */}
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Pending Tasks</h2>
                </div>
                <div className="space-y-4">
                  {pendingTasks.map((task, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 flex-1">{task.task}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-600'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" className="w-full mt-4" size="sm">
                  View All Tasks
                </Button>
              </Card>
            </div>

            {/* Quick Insights */}
            <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Financial Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">This Month</p>
                      <p className="text-lg font-bold text-gray-900">$45.2K</p>
                      <p className="text-xs text-green-600 mt-1">↑ 8.5%</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Avg. Transaction</p>
                      <p className="text-lg font-bold text-gray-900">$1,247</p>
                      <p className="text-xs text-gray-600 mt-1">156 transactions</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Pending Reviews</p>
                      <p className="text-lg font-bold text-gray-900">23</p>
                      <p className="text-xs text-yellow-600 mt-1">Requires attention</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
    </>
  );
};

