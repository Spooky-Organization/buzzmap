'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  ClipboardList,
  Plus,
  BarChart3,
  Settings,
  Hexagon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/business/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/business/shelf', label: 'Product Shelf', icon: Store },
  { href: '/business/orders', label: 'Orders', icon: ClipboardList },
  { href: '/business/posts/create', label: 'Create Post', icon: Plus },
  { href: '/business/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/business/settings', label: 'Settings', icon: Settings },
];

function BusinessSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/business/dashboard"
          className="flex items-center gap-2 px-2 py-1 font-bold text-lg text-sidebar-primary"
        >
          <Hexagon className="size-5 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">BuzzMap</span>
        </Link>
        <p className="px-2 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          Business Portal
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href || pathname.startsWith(href + '/');
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={label}
                      render={<Link href={href} />}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <BusinessSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger />
          <span className="text-lg font-bold text-accent">BuzzMap</span>
          <span className="text-sm text-muted-foreground">Business</span>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
