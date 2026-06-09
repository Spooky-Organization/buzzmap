'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/shared/error-state';
import { appRoutes } from '@/lib/routes';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const handleRefresh = () => {
    reset();
    window.location.reload();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(appRoutes.home);
  };

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <ErrorState
          title="We hit an unexpected problem"
          message="BuzzMap could not finish that request. Please refresh the page or try again shortly."
          onRefresh={handleRefresh}
          onBack={handleBack}
        />
      </body>
    </html>
  );
}
