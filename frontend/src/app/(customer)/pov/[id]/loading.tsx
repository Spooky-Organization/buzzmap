import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerPOVDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-6">
      <Skeleton className="h-10 w-36" />
      <Skeleton className="aspect-video w-full rounded-3xl" />
      <Skeleton className="h-56 w-full rounded-3xl" />
      <Skeleton className="h-72 w-full rounded-3xl" />
    </div>
  );
}
