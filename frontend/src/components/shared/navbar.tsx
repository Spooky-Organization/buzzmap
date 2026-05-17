'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Bell, MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useNotifications } from '@/hooks/use-notifications';
import { appRoutes } from '@/lib/routes';

export function Navbar() {
  const { data: session } = useSession();
  const { unreadCount } = useNotifications();

  const user = session?.user;
  const dashboardHref =
    user?.role === 'ADMIN'
      ? appRoutes.admin.overview
      : user?.role === 'BUSINESS_OWNER'
        ? appRoutes.business.dashboard
        : appRoutes.customer.dashboard;
  const notificationsHref =
    user?.role === 'ADMIN'
      ? appRoutes.admin.notifications
      : user?.role === 'BUSINESS_OWNER'
        ? appRoutes.business.notifications
        : appRoutes.customer.notifications;
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-primary text-primary-foreground shadow-sm">
      <div className="flex h-14 items-center gap-3 px-4">
        {/* Sidebar toggle — handles both mobile sheet and desktop collapse */}
        <SidebarTrigger className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground" />

        {/* Logo */}
        <Link href={appRoutes.customer.feed} className="flex items-center gap-2 font-bold text-lg text-accent">
          BuzzMap
        </Link>

        <div className="flex-1" />

        {/* Nav icons */}
        <nav className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={<Link href={appRoutes.customer.search} aria-label="Search" />}
            className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
          >
            <Search />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={<Link href={appRoutes.customer.messages} aria-label="Messages" />}
            className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
          >
            <MessageSquare />
          </Button>

          {/* Notifications with unread badge */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              nativeButton={false}
              render={<Link href={notificationsHref} aria-label="Notifications" />}
              className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
            >
              <Bell />
            </Button>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="pointer-events-none absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px] leading-none"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none ring-ring focus-visible:ring-2">
              <Avatar size="sm">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? 'User'} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{user?.name ?? 'Account'}</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href={dashboardHref} />}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href={user?.id ? appRoutes.user.byId(user.id) : appRoutes.home} />}>
                  Profile
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setTimeout(() => signOut({ redirectTo: appRoutes.auth.login }), 0);
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
