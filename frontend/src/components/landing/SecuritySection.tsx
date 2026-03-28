import {
  Shield,
  Lock,
  Clock,
  Database,
  Network,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

const securityFeatures = [
  {
    icon: Shield,
    title: 'OWASP Top 10',
    description: 'All security categories addressed including injection, authentication, and XSS protection.',
    color: 'from-emerald-400 to-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    icon: Lock,
    title: 'Account Lockout',
    description: 'Automatic lockout after 4 failed attempts, permanent ban after 6 attempts.',
    color: 'from-amber-400 to-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    icon: Database,
    title: 'Rate Limiting',
    description: 'Redis-backed rate limiting: 100/min general, 5/min auth, 3/hour password reset.',
    color: 'from-rose-400 to-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
  {
    icon: Eye,
    title: 'Input Sanitization',
    description: 'DOMPurify + HTML encoding + parameterized queries for complete XSS protection.',
    color: 'from-violet-400 to-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
  },
  {
    icon: Network,
    title: 'Security Headers',
    description: 'Helmet middleware with CSP, HSTS, X-Frame-Options, and CORS protection.',
    color: 'from-cyan-400 to-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  {
    icon: Clock,
    title: 'Session Management',
    description: 'Redis session storage, automatic token refresh, secure logout with rotation.',
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
];

const stats = [
  { value: '10', label: 'OWASP Categories' },
  { value: '6', label: 'Failed Attempt Ban' },
  { value: '3', label: 'Cache TTL Tiers' },
  { value: '405', label: 'Method Errors' },
];

export const SecuritySection = () => {
  return (
    <section id="security" className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl mb-6">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Enterprise-Grade Security
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Built with security-first principles. Every feature follows OWASP guidelines and best practices.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <Card
              key={index}
              variant="elevated"
              padding="lg"
              className={`bg-white/5 backdrop-blur-sm border ${feature.borderColor} hover:bg-white/10 transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center flex-shrink-0`}
                >
                  <feature.icon className={`h-6 w-6 bg-gradient-to-r ${feature.color} bg-clip-text`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to={ROUTES.REGISTER}>
            <Button
              variant="primary"
              size="lg"
              icon={<CheckCircle className="h-5 w-5" />}
              className="shadow-lg shadow-primary-500/25"
            >
              Start Building Securely
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
