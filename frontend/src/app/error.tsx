'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/shared/error-state';
import { appRoutes } from '@/lib/routes';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const handleRefresh = () => {
    reset();
    router.refresh();
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
    <ErrorState
      title="Something went wrong"
      message="We could not load this part of BuzzMap right now. Try again, or head back to a safe page and retry in a moment."
      onRefresh={handleRefresh}
      onBack={handleBack}
    />
  );
}
