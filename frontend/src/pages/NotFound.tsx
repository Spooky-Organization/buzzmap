import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/glass-card';
import { ROUTES } from '@/utils/constants';
import { SEO } from '@/components/seo/SEO';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Page Not Found" 
        description="The page you are looking for does not exist."
        noindex={true}
      />
      <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Page not found</h2>
        <p className="text-[var(--foreground-muted)] mb-6">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="primary" icon={<Home className="h-5 w-5" />}>
            Go home
          </Button>
        </Link>
      </Card>
    </div>
  );
};

