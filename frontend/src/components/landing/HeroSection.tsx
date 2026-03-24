import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Play,
  Zap,
  Lock,
  Users,
  Activity,
  Code,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';
import { isAuthenticated } from '@/utils/sessionCheck';

const techBadges = [
  { name: 'TypeScript', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { name: 'React 18', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { name: 'Node.js', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { name: 'PostgreSQL', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { name: 'Redis', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
];

const trustIndicators = [
  { icon: Shield, text: 'OWASP Compliant' },
  { icon: Lock, text: 'JWT + MFA' },
  { icon: Users, text: 'RBAC Built-in' },
  { icon: Activity, text: 'Real-time SSE' },
  { icon: Code, text: 'API v1 Ready' },
  { icon: Zap, text: 'Performance Optimized' },
];

export const HeroSection = () => {
  const authenticated = isAuthenticated();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-primary-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] bg-secondary-500/20 rounded-full blur-[120px] animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[150px]" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white/90 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Production-Ready • Open Source</span>
          </div>

          {/* Main Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/25">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
            Enterprise-Grade Dashboard
            <span className="block mt-2 bg-gradient-to-r from-primary-300 via-secondary-300 to-primary-400 bg-clip-text text-transparent">
              Template for Modern Apps
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Build secure, scalable applications faster. JWT Auth • Multi-Factor Authentication 
            • Role-Based Access Control • Real-time SSE • OWASP Top 10 Compliant.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up animation-delay-400">
            <Link to={authenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}>
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="h-5 w-5" />}
                iconPosition="right"
                className="min-w-[180px] shadow-xl shadow-primary-500/25 bg-white text-primary-600 hover:bg-gray-50 hover:shadow-2xl hover:shadow-primary-500/30 group"
              >
                {authenticated ? 'Go to Dashboard' : 'Get Started Free'}
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button
                variant="outline"
                size="lg"
                icon={<Play className="h-5 w-5" />}
                className="min-w-[180px] border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
              >
                Try Demo
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12 animate-fade-in-up animation-delay-600">
            {trustIndicators.map((indicator, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-xs text-white/80"
              >
                <indicator.icon className="h-3.5 w-3.5" />
                <span>{indicator.text}</span>
              </div>
            ))}
          </div>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up animation-delay-800">
            {techBadges.map((badge, index) => (
              <span
                key={index}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${badge.color}`}
              >
                {badge.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-scroll" />
        </div>
      </div>
    </section>
  );
};
