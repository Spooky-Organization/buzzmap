'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  MessageSquare,
  ShoppingCart,
  Package,
  LayoutDashboard,
  Plus,
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
  { href: appRoutes.customer.dashboard, label: 'Home', icon: LayoutDashboard },
  { href: appRoutes.customer.search, label: 'Search', icon: Search },
  { href: appRoutes.customer.povCreate, label: 'Create POV', icon: Plus },
  { href: appRoutes.customer.messages, label: 'Messages', icon: MessageSquare },
  { href: appRoutes.customer.cart, label: 'Cart', icon: ShoppingCart },
  { href: appRoutes.customer.orders, label: 'Orders', icon: Package },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarBrand
        href={appRoutes.customer.dashboard}
        label="BuzzMap"
        subtitle="Customer workspace for discovery, POV reviews, orders, and conversations."
      />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== appRoutes.customer.dashboard && pathname.startsWith(href + '/'));
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
