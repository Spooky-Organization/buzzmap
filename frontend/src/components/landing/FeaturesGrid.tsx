import {
  Shield,
  Lock,
  Users,
  Activity,
  Zap,
  Database,
  RefreshCw,
  Code,
  Package,
} from 'lucide-react';
import { Card } from '@/components/ui/glass-card';

const features = [
  {
    icon: Shield,
    title: 'JWT Authentication',
    description: 'Token-based auth with automatic refresh, secure storage, and XSS protection.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Lock,
    title: 'Multi-Factor Auth',
    description: 'TOTP-based 2FA with backup codes, QR code generation, and secure verification.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Flexible RBAC with USER, ACCOUNTANT, and ADMIN roles and permissions.',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: Activity,
    title: 'Real-time SSE',
    description: 'Server-Sent Events for live notifications and session synchronization.',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    icon: Zap,
    title: 'Redis Caching',
    description: 'Session caching, rate limiting, and query optimization with 3-tier TTL.',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    icon: RefreshCw,
    title: 'API Versioning',
    description: 'Versioned API endpoints (/api/v1) with backward compatibility support.',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Database,
    title: 'Account Lockout',
    description: 'Brute-force protection with automatic lockout after 4 failed attempts.',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  {
    icon: Code,
    title: 'Method Restriction',
    description: 'HTTP method enforcement on all routes for enhanced security.',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
];

export const FeaturesGrid = () => {
  return (
    <section id="features" className="py-24 bg-gray-900">
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl mb-6">
            <Package className="h-8 w-8 text-primary-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A complete, production-ready authentication system with enterprise-grade security features built in.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="elevated"
              padding="lg"
              className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gray-800/50 border border-gray-700 backdrop-blur-sm"
            >
              {/* Gradient Accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`}
              />

              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-14 h-14 ${feature.bgColor} rounded-xl ${feature.iconColor} mb-5 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="h-7 w-7" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
