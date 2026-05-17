'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownAZ,
  ArrowUpZA,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  MapPin,
  ScanSearch,
  Search,
  Shield,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';
import { AdminPageShell } from '@/components/admin/admin-page-shell';
import { AdminUserDetailDialog } from '@/components/admin/admin-user-detail-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';

type UserRoleTab = 'CUSTOMER' | 'BUSINESS_OWNER' | 'ADMIN';
type SortBy = 'name' | 'createdAt' | 'role';
type SortOrder = 'asc' | 'desc';

interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRoleTab;
  location: string | null;
  createdAt: string;
  businessProfile: null | {
    id: string;
    businessName: string;
    category: string;
    isVerified: boolean;
  };
}

interface UsersResponse {
  data: AdminUserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ROLE_META: Record<
  UserRoleTab,
  {
    label: string;
    icon: React.ElementType;
    summaryLabel: string;
  }
> = {
  CUSTOMER: {
    label: 'Customers',
    icon: UserRound,
    summaryLabel: 'Customers',
  },
  BUSINESS_OWNER: {
    label: 'Business Owners',
    icon: BriefcaseBusiness,
    summaryLabel: 'Business Owners',
  },
  ADMIN: {
    label: 'Admins',
    icon: Shield,
    summaryLabel: 'Admins',
  },
};

const roleTabs: UserRoleTab[] = ['CUSTOMER', 'BUSINESS_OWNER', 'ADMIN'];

function roleBadgeVariant(role: UserRoleTab) {
  if (role === 'ADMIN') return 'destructive' as const;
  if (role === 'BUSINESS_OWNER') return 'secondary' as const;
  return 'outline' as const;
}

export default function AdminUsersPage() {
  const [activeRole, setActiveRole] = useState<UserRoleTab>('CUSTOMER');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const deferredKeyword = useDeferredValue(keyword);

  const { data: countsData } = useQuery({
    queryKey: ['admin-user-counts'],
    queryFn: async () => {
      const [customersRes, businessRes, adminsRes] = await Promise.all([
        api.get<UsersResponse>(apiRoutes.admin.users, {
          params: { role: 'CUSTOMER', page: 1, limit: 1 },
        }),
        api.get<UsersResponse>(apiRoutes.admin.users, {
          params: { role: 'BUSINESS_OWNER', page: 1, limit: 1 },
        }),
        api.get<UsersResponse>(apiRoutes.admin.users, {
          params: { role: 'ADMIN', page: 1, limit: 1 },
        }),
      ]);

      return {
        CUSTOMER: customersRes.data.total,
        BUSINESS_OWNER: businessRes.data.total,
        ADMIN: adminsRes.data.total,
      };
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', activeRole, deferredKeyword, page, sortBy, sortOrder],
    queryFn: async () => {
      const res = await api.get<UsersResponse>(apiRoutes.admin.users, {
        params: {
          role: activeRole,
          keyword: deferredKeyword || undefined,
          page,
          limit: 8,
          sortBy,
          sortOrder,
        },
      });
      return res.data;
    },
  });

  const users = data?.data ?? [];
  const pageNumbers = useMemo(() => {
    const totalPages = data?.totalPages ?? 1;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [data?.totalPages, page]);

  const totalIndexedUsers =
    (countsData?.CUSTOMER ?? 0) + (countsData?.BUSINESS_OWNER ?? 0) + (countsData?.ADMIN ?? 0);

  function handleRoleChange(value: string) {
    setActiveRole(value as UserRoleTab);
    setPage(1);
    setSelectedUser(null);
  }

  function handleKeywordChange(value: string) {
    setKeyword(value);
    setPage(1);
  }

  const statusLabel = `${data?.total ?? 0} ${ROLE_META[activeRole].label.toLowerCase()} indexed`;

  return (
    <AdminPageShell
      title="Users"
      description="Review customers, business owners, and admins through a searchable admin directory without leaving the control-plane shell."
      status={statusLabel}
    >
      <Card className="overflow-hidden border-primary/15 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_28%),linear-gradient(180deg,rgba(15,37,64,0.06),rgba(15,37,64,0))] shadow-[0_24px_80px_-42px_rgba(15,37,64,0.58)]">
        <CardContent className="grid gap-5 p-6 lg:grid-cols-[1.2fr_0.9fr] lg:p-8">
          <div className="space-y-4">
            <Badge className="w-fit rounded-full border-primary/20 bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
              Directory intelligence
            </Badge>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <UserRound className="size-6" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-primary">
                  Search people, inspect roles, and spot anomalies faster.
                </h2>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                The admin user surface is tuned for triage: role segmentation first, then
                search, then quick inspection without leaving the directory context.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InsightPill
              icon={ScanSearch}
              label="Inspection mode"
              value="Modal driven"
              note="Open a user without navigating away."
            />
            <InsightPill
              icon={SlidersHorizontal}
              label="Filtering"
              value="Live role tabs"
              note="Search and sorting sync to the active lane."
            />
            <InsightPill
              icon={CircleDot}
              label="Coverage"
              value={`${totalIndexedUsers} users`}
              note="Searchable accounts across every authenticated role."
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {roleTabs.map((role) => {
          const Icon = ROLE_META[role].icon;
          return (
            <SummaryCard
              key={role}
              label={ROLE_META[role].summaryLabel}
              value={countsData?.[role] ?? 0}
              icon={Icon}
              active={activeRole === role}
            />
          );
        })}
      </div>

      <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-48px_rgba(15,37,64,0.7)]">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ScanSearch className="size-5 text-primary" />
                User Directory
              </CardTitle>
              <CardDescription>
                Filter by role tab, search by name or email, sort the directory, and inspect a
                user in a modal.
              </CardDescription>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <MiniStat
                label="Active lane"
                value={ROLE_META[activeRole].label}
                icon={ROLE_META[activeRole].icon}
              />
              <MiniStat label="Results" value={String(data?.total ?? 0)} icon={Search} />
              <MiniStat
                label="Page"
                value={`${data?.page ?? 1}/${Math.max(data?.totalPages ?? 1, 1)}`}
                icon={Clock3}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Tabs value={activeRole} onValueChange={handleRoleChange} className="w-full">
              <TabsList className="grid w-full grid-cols-1 rounded-2xl border border-border/70 bg-muted/50 p-1 sm:w-auto sm:grid-cols-3">
                {roleTabs.map((role) => {
                  const Icon = ROLE_META[role].icon;
                  return (
                    <TabsTrigger
                      key={role}
                      value={role}
                      className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Icon data-icon="inline-start" />
                      {ROLE_META[role].label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {roleTabs.map((role) => (
                <TabsContent key={role} value={role} className="hidden" />
              ))}
            </Tabs>

            <div className="flex flex-col gap-3 md:flex-row xl:items-center">
              <div className="relative min-w-[260px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(event) => handleKeywordChange(event.target.value)}
                  placeholder={`Search ${ROLE_META[activeRole].label.toLowerCase()} by name or email`}
                  className="rounded-2xl border-border/70 bg-background/90 pl-9"
                />
              </div>

              <Select
                value={`${sortBy}:${sortOrder}`}
                onValueChange={(value) => {
                  if (!value) return;
                  const [nextSortBy, nextSortOrder] = value.split(':') as [SortBy, SortOrder];
                  setSortBy(nextSortBy);
                  setSortOrder(nextSortOrder);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full rounded-2xl border-border/70 bg-background/90 md:w-[220px]">
                  <SelectValue placeholder="Sort users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">
                    <CalendarLabel order="desc" label="Newest first" />
                  </SelectItem>
                  <SelectItem value="createdAt:asc">
                    <CalendarLabel order="asc" label="Oldest first" />
                  </SelectItem>
                  <SelectItem value="name:asc">
                    <ArrowDownAZ data-icon="inline-start" />
                    Name A-Z
                  </SelectItem>
                  <SelectItem value="name:desc">
                    <ArrowUpZA data-icon="inline-start" />
                    Name Z-A
                  </SelectItem>
                  <SelectItem value="role:asc">
                    <Shield data-icon="inline-start" />
                    Role ascending
                  </SelectItem>
                  <SelectItem value="role:desc">
                    <Shield data-icon="inline-start" />
                    Role descending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-border/70 bg-background/90">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/35">
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-12 w-full rounded-xl" />
                        </TableCell>
                      </TableRow>
                    ))
                  : users.map((user) => {
                      const initials = user.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <TableRow key={user.id} className="hover:bg-primary/[0.03]">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar size="default">
                                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                <AvatarFallback>{initials}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-foreground">{user.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  ID: {user.id.slice(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="size-3.5" />
                              {user.location ?? 'Not set'}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-primary/15"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Search data-icon="inline-start" />
                              Inspect
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>

            {!isLoading && users.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No {ROLE_META[activeRole].label.toLowerCase()} matched that search.
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 border-t border-border/70 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data?.page ?? 1} of {Math.max(data?.totalPages ?? 1, 1)}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-border/70"
                disabled={(data?.page ?? 1) <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft data-icon="inline-start" />
                Previous
              </Button>

              {pageNumbers.map((pageNumber, index) => (
                <Button
                  key={`users-page-${pageNumber}-${index}`}
                  variant={pageNumber === (data?.page ?? 1) ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-border/70"
                disabled={(data?.page ?? 1) >= (data?.totalPages ?? 1)}
                onClick={() =>
                  setPage((current) => Math.min(data?.totalPages ?? current, current + 1))
                }
              >
                Next
                <ChevronRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdminUserDetailDialog
        user={selectedUser}
        open={selectedUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
          }
        }}
      />
    </AdminPageShell>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  active,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Card
      className={`overflow-hidden border-border/70 shadow-[0_20px_50px_-42px_rgba(15,37,64,0.7)] ${
        active
          ? 'border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))]'
          : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))]'
      }`}
    >
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {active ? 'Current focus' : 'Available lane'}
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarLabel({
  order,
  label,
}: {
  order: SortOrder;
  label: string;
}) {
  return (
    <>
      {order === 'desc' ? (
        <ArrowDownAZ data-icon="inline-start" />
      ) : (
        <ArrowUpZA data-icon="inline-start" />
      )}
      {label}
    </>
  );
}

function InsightPill({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/85 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
        <Icon className="size-5" />
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs leading-6 text-muted-foreground">{note}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/90 px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
