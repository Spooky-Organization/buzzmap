'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Bell, ChevronsUpDown, LoaderCircle, LogOut, UserCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/hooks/use-notifications';
import { appRoutes } from '@/lib/routes';

interface SidebarAccountProps {
  profileHref?: string;
}

export function SidebarAccount({ profileHref }: SidebarAccountProps) {
  const { data: session } = useSession();
  const { unreadCount } = useNotifications();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const user = session?.user;
  const name = user?.name ?? 'BuzzMap User';
  const email = user?.email ?? 'Signed in';
  const resolvedProfileHref = profileHref ?? (user?.id ? appRoutes.user.byId(user.id) : appRoutes.home);
  const notificationsHref =
    user?.role === 'ADMIN'
      ? appRoutes.admin.notifications
      : user?.role === 'BUSINESS_OWNER'
        ? appRoutes.business.notifications
        : appRoutes.customer.notifications;
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut({ redirectTo: appRoutes.auth.login });
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <SidebarFooter className="gap-3 border-t border-sidebar-border/60 px-2 pb-3 pt-3">
      <SidebarMenu>
        <SidebarMenuItem className="group-data-[collapsible=icon]:mx-auto">
          <SidebarMenuButton
            tooltip="Notifications"
            render={<Link href={notificationsHref} />}
            className="justify-between"
          >
            <div className="flex items-center gap-2">
              <Bell />
              <span className="group-data-[collapsible=icon]:hidden">Notifications</span>
            </div>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="h-5 min-w-5 justify-center rounded-full px-1 text-[10px] group-data-[collapsible=icon]:hidden"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open account menu"
          className="w-full rounded-md outline-none ring-ring focus-visible:ring-2 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-8"
        >
          <div className="flex h-8 w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
            <Avatar size="sm">
              <AvatarImage src={user?.image ?? undefined} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{name}</p>
              <p className="truncate text-xs text-sidebar-foreground/65">{email}</p>
            </div>
            <ChevronsUpDown className="size-4 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-xl border border-border/70 p-1.5 shadow-lg">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-2">
              <div className="space-y-0.5">
                <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">{email}</p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link href={resolvedProfileHref} />}>
              <UserCircle2 />
              Profile
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            {isSigningOut ? <LoaderCircle className="animate-spin" /> : <LogOut />}
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}
