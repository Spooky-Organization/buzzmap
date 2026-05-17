import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';

interface AdminPageShellProps {
  title: string;
  description: string;
  status?: string;
  children: ReactNode;
}

export function AdminPageShell({
  title,
  description,
  status,
  children,
}: AdminPageShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {status ? (
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs">
            {status}
          </Badge>
        ) : null}
      </div>
      {children}
    </div>
  );
}
