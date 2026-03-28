import { Link } from 'react-router-dom';
import { Github, BookOpen, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/utils/constants';

export const CTASection = () => {
  return (
    <section className="py-24 bg-gray-900 border-t border-gray-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container-custom max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 mb-8">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span>Open Source • MIT License</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Build Something Amazing?
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
          Join thousands of developers using DashLabs to build secure, scalable applications. 
          Star the project on GitHub to show your support.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={ROUTES.REGISTER}>
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="h-5 w-5" />}
              iconPosition="right"
              className="min-w-[200px] shadow-xl shadow-primary-500/25"
            >
              Get Started Free
            </Button>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              icon={<Github className="h-5 w-5" />}
              className="min-w-[200px]"
            >
              View on GitHub
            </Button>
          </a>
        </div>

        {/* Secondary CTA */}
        <div className="mt-12">
          <p className="text-gray-500 text-sm mb-4">
            Prefer to read first?
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button
              variant="ghost"
              size="sm"
              icon={<BookOpen className="h-4 w-4" />}
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              Explore the Documentation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
