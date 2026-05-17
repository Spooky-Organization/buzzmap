'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Boxes,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
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
import { SidebarAccount } from '@/components/shared/sidebar-account';
import { SidebarBrand } from '@/components/shared/sidebar-brand';
import { appRoutes } from '@/lib/routes';

const monitorItems = [
  { href: appRoutes.admin.overview, label: 'Overview', icon: LayoutDashboard },
  { href: appRoutes.admin.security, label: 'Security', icon: ShieldCheck },
  { href: appRoutes.admin.system, label: 'System', icon: Activity },
  { href: appRoutes.admin.auditLog, label: 'Audit Log', icon: ScrollText },
];

const operateItems = [
  { href: appRoutes.admin.users, label: 'Users', icon: Users },
  { href: appRoutes.admin.businesses, label: 'Businesses', icon: Building2 },
  { href: appRoutes.admin.catalog, label: 'Catalog', icon: Boxes },
  { href: appRoutes.admin.orders, label: 'Orders', icon: ClipboardList },
  { href: appRoutes.admin.messages, label: 'Messages', icon: MessageSquareWarning },
];

const governItems = [
  { href: appRoutes.admin.moderation, label: 'Moderation', icon: ShieldCheck },
  { href: appRoutes.admin.announcements, label: 'Announcements', icon: Megaphone },
  { href: appRoutes.admin.settings, label: 'Settings', icon: Settings },
];

function SidebarNavGroup({
  label,
  items,
}: {
  label: string;
  items: Array<{ href: string; label: string; icon: React.ElementType }>;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ href, label: itemLabel, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={itemLabel}
                  render={<Link href={href} />}
                >
                  <Icon />
                  <span>{itemLabel}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarBrand
        href={appRoutes.admin.overview}
        label="BuzzMap Admin"
        subtitle="Control plane for customers, businesses, trust, and system operations."
      />

      <SidebarContent>
        <SidebarNavGroup label="Monitor" items={monitorItems} />
        <SidebarNavGroup label="Operate" items={operateItems} />
        <SidebarNavGroup label="Govern" items={governItems} />
      </SidebarContent>

      <SidebarAccount />
    </Sidebar>
  );
}
