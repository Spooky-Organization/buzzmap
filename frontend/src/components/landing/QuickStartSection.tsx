import { Link } from 'react-router-dom';
import { Copy, Rocket, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/utils/constants';

const steps = [
  {
    number: '01',
    title: 'Clone Repository',
    description: 'Get the latest version from our GitHub repository.',
    code: 'git clone <repository-url>',
  },
  {
    number: '02',
    title: 'Configure Environment',
    description: 'Copy the example env file and configure your settings.',
    code: 'cp .env.example .env',
  },
  {
    number: '03',
    title: 'Start Services',
    description: 'Launch all services with Docker Compose.',
    code: './dev.sh start',
  },
  {
    number: '04',
    title: 'Access Dashboard',
    description: 'Open your browser and start building.',
    code: 'http://localhost:3014',
  },
];

const benefits = [
  'Production-ready in minutes',
  'No credit card required',
  'Open source MIT license',
  'Comprehensive documentation',
];

export const QuickStartSection = () => {
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <section id="docs" className="py-24 bg-gray-900">
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl mb-6">
            <Rocket className="h-8 w-8 text-primary-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Four simple steps to a production-ready authentication system.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <Card
              key={index}
              variant="elevated"
              padding="lg"
              className="relative overflow-hidden bg-gray-800/50 border border-gray-700 backdrop-blur-sm"
            >
              {/* Step Number */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-bl-full" />
              <div className="relative">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-4">
                  {step.number}
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-sm text-gray-400 mb-4">
                  {step.description}
                </p>

                {/* Code Block */}
                <div className="bg-black/50 rounded-lg p-3 group border border-gray-700">
                  <div className="flex items-center justify-between">
                    <code className="text-xs text-gray-300 font-mono truncate flex-1">
                      {step.code}
                    </code>
                    <button
                      onClick={() => handleCopy(step.code)}
                      className="ml-2 p-1 text-gray-500 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Benefits Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-gray-400"
            >
              <Check className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to={ROUTES.REGISTER}>
            <Button
              variant="primary"
              size="lg"
              icon={<Rocket className="h-5 w-5" />}
              className="shadow-lg shadow-primary-500/25"
            >
              Start Building Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
