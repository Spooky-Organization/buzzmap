import {
  Layers,
  Code,
  Server,
  Database,
  Activity,
  Zap,
  Globe,
  Cpu,
  Shield,
  Package,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

const frontendStack = [
  { name: 'React 18', icon: Globe },
  { name: 'TypeScript', icon: Code },
  { name: 'Vite', icon: Zap },
  { name: 'Tailwind CSS', icon: Layers },
  { name: 'React Router', icon: Package },
];

const backendStack = [
  { name: 'Node.js', icon: Cpu },
  { name: 'Express', icon: Server },
  { name: 'Prisma ORM', icon: Database },
  { name: 'PostgreSQL', icon: Database },
  { name: 'Redis', icon: Activity },
];

const infrastructureStack = [
  { name: 'Docker', icon: Package },
  { name: 'Nginx', icon: Server },
  { name: 'JWT Tokens', icon: Shield },
  { name: 'Resend API', icon: Zap },
  { name: 'Health Checks', icon: Activity },
];

const highlights = [
  {
    icon: Database,
    title: '6 Database Indexes',
    description: 'Optimized queries with strategic indexing on email, role, and timestamps.',
  },
  {
    icon: Activity,
    title: '3-Tier Redis Cache',
    description: 'User: 5min, Session: 7 days, Query: 1min with automatic invalidation.',
  },
  {
    icon: Layers,
    title: 'Modular Architecture',
    description: 'Self-contained modules for easy maintenance and potential extraction.',
  },
  {
    icon: Code,
    title: 'API Versioning',
    description: '/api/v1 with backward compatibility and clean route structure.',
  },
];

export const ArchitectureSection = () => {
  return (
    <section id="architecture" className="py-24 bg-gray-900">
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl mb-6">
            <Layers className="h-8 w-8 text-primary-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Modular Architecture
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Clean, maintainable code structure designed for scalability and easy customization.
          </p>
        </div>

        {/* Stack Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* Frontend */}
          <Card variant="elevated" padding="lg" className="text-center bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="h-7 w-7 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">Frontend</h3>
            <div className="space-y-3">
              {frontendStack.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <tech.icon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{tech.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Backend */}
          <Card variant="elevated" padding="lg" className="text-center bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Server className="h-7 w-7 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">Backend</h3>
            <div className="space-y-3">
              {backendStack.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <tech.icon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{tech.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Infrastructure */}
          <Card variant="elevated" padding="lg" className="text-center bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-7 w-7 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">Infrastructure</h3>
            <div className="space-y-3">
              {infrastructureStack.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <tech.icon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{tech.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <item.icon className="h-6 w-6 text-primary-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">{item.title}</h4>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
