'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Video,
  MessageSquare,
  ShoppingCart,
  ClipboardList,
  LayoutDashboard,
} from 'lucide-react';
import { appRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

const navItems = [
  { href: appRoutes.customer.feed, label: 'Feed', icon: Home },
  { href: appRoutes.customer.search, label: 'Search', icon: Search },
  { href: appRoutes.customer.povCreate, label: 'Create POV', icon: Video },
  { href: appRoutes.customer.messages, label: 'Messages', icon: MessageSquare },
  { href: appRoutes.customer.cart, label: 'Cart', icon: ShoppingCart },
  { href: appRoutes.customer.orders, label: 'Orders', icon: ClipboardList },
  { href: appRoutes.customer.dashboard, label: 'Dashboard', icon: LayoutDashboard },
];

export function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-background py-4">
      <div className="px-4 pb-4">
        <span className="text-lg font-bold text-brand-amber">BuzzMap</span>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-amber/10 text-brand-amber'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-background">
      <SidebarContent />
    </aside>
  );
}
