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
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { appRoutes } from '@/lib/routes';
import { SidebarAccount } from '@/components/shared/sidebar-account';
import { SidebarBrand } from '@/components/shared/sidebar-brand';

const navItems = [
  { href: appRoutes.business.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { href: appRoutes.business.shelf, label: 'Product Shelf', icon: Store },
  { href: appRoutes.business.orders, label: 'Orders', icon: ClipboardList },
  { href: appRoutes.business.postsCreate, label: 'Create Post', icon: Plus },
  { href: appRoutes.business.analytics, label: 'Analytics', icon: BarChart3 },
  { href: appRoutes.business.settings, label: 'Settings', icon: Settings },
];

export function BusinessSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarBrand
        href={appRoutes.business.dashboard}
        label="BuzzMap"
        subtitle="Business workspace for listings, orders, customer trust, and growth signals."
      />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');
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
      <SidebarAccount />
    </Sidebar>
  );
}
