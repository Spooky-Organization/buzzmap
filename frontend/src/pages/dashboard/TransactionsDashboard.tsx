import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AutoSEO } from '@/components/seo/SEO';

export const TransactionsDashboard = () => {
  // Mock data for Transactions Dashboard
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
      label: 'Pending',
      value: '23',
      change: '-5',
      trend: 'down',
      icon: <Clock className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Completed',
      value: '1,198',
      change: '+12%',
      trend: 'up',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Failed',
      value: '26',
      change: '-3',
      trend: 'down',
      icon: <XCircle className="h-6 w-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const recentTransactions = [
    {
      id: 'TXN-001',
      description: 'Payment from Client A',
      amount: '$5,250.00',
      status: 'completed',
      date: '2025-01-15',
      type: 'income',
    },
    {
      id: 'TXN-002',
      description: 'Office Supplies Purchase',
      amount: '$450.00',
      status: 'pending',
      date: '2025-01-15',
      type: 'expense',
    },
    {
      id: 'TXN-003',
      description: 'Service Fee Payment',
      amount: '$1,200.00',
      status: 'completed',
      date: '2025-01-14',
      type: 'income',
    },
    {
      id: 'TXN-004',
      description: 'Software Subscription',
      amount: '$299.00',
      status: 'completed',
      date: '2025-01-14',
      type: 'expense',
    },
    {
      id: 'TXN-005',
      description: 'Consulting Fee',
      amount: '$3,500.00',
      status: 'pending',
      date: '2025-01-13',
      type: 'income',
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
                This page displays mock/sample transaction data for demonstration purposes only. 
                All transaction information shown here is simulated and not connected to any real financial system.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">View and manage all financial transactions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
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

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-mono text-gray-900">{transaction.id}</td>
                    <td className="py-4 px-4 text-sm text-gray-700">{transaction.description}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">{transaction.amount}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{transaction.date}</td>
                    <td className="py-4 px-4">
                      {transaction.type === 'income' ? (
                        <span className="inline-flex items-center text-sm text-green-600">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          Income
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-sm text-red-600">
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                          Expense
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
    </>
  );
};

