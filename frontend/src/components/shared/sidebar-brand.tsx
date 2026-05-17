'use client';

import Link from 'next/link';
import { SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';

export function SidebarBrand({
  href,
  label,
  subtitle,
}: {
  href: string;
  label: string;
  subtitle?: string;
}) {
  return (
    <SidebarHeader>
      <div className="flex items-center gap-2 px-1">
        <SidebarTrigger className="hidden text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:flex" />
        <Link
          href={href}
          className="flex min-w-0 items-center gap-2 py-1 font-bold text-lg text-sidebar-primary group-data-[collapsible=icon]:hidden"
        >
          <span className="truncate">{label}</span>
        </Link>
      </div>
      {subtitle ? (
        <p className="px-2 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          {subtitle}
        </p>
      ) : null}
    </SidebarHeader>
  );
}
