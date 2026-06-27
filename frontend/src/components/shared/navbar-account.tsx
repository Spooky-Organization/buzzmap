'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { LoaderCircle, LogOut, UserCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { appRoutes } from '@/lib/routes';

interface NavbarAccountProps {
  profileHref?: string;
}

export function NavbarAccount({ profileHref }: NavbarAccountProps) {
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const user = session?.user;
  const name = user?.name ?? 'BuzzMap User';
  const email = user?.email ?? 'Signed in';
  const resolvedProfileHref = profileHref ?? (user?.id ? appRoutes.user.byId(user.id) : appRoutes.home);
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
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className="rounded-full outline-none ring-ring transition-opacity hover:opacity-90 focus-visible:ring-2"
      >
        <Avatar size="sm">
          <AvatarImage src={user?.image ?? undefined} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
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
  );
}
