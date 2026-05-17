'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownAZ,
  ArrowUpZA,
  CircleDot,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { AdminPageShell } from '@/components/admin/admin-page-shell';
import { AdminOrderDetailDialog } from '@/components/admin/admin-order-detail-dialog';
import { DashboardHero, DashboardHeroPill } from '@/components/dashboard/dashboard-surfaces';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';

type SortBy = 'createdAt' | 'totalAmount' | 'status';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface AdminOrderListItem {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  businesses: Array<{
    id: string;
    businessName: string;
  }>;
}

interface OrdersResponse {
  data: AdminOrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function statusVariant(status: AdminOrderListItem['status']) {
  switch (status) {
    case 'CONFIRMED':
      return 'default' as const;
    case 'COMPLETED':
      return 'secondary' as const;
    case 'CANCELLED':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderListItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter, sortBy, sortOrder],
    queryFn: async () => {
      const res = await api.get<OrdersResponse>(apiRoutes.admin.orders, {
        params: {
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          page,
          limit: 8,
          sortBy,
          sortOrder,
        },
      });
      return res.data;
    },
  });

  const orders = data?.data ?? [];
  const summary = {
    pending: orders.filter((order) => order.status === 'PENDING').length,
    confirmed: orders.filter((order) => order.status === 'CONFIRMED').length,
    value: orders.reduce((sum, order) => sum + order.totalAmount, 0),
  };

  const pageNumbers = useMemo(() => {
    const totalPages = data?.totalPages ?? 1;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [data?.totalPages, page]);

  return (
    <AdminPageShell
      title="Orders"
      description="Review global order flow in a sortable admin table, filter by status, and inspect order context in a modal."
      status={`${data?.total ?? 0} indexed orders`}
    >
      <DashboardHero
        eyebrow="Order directory"
        title="Review order flow in the same branded control-plane system."
        description="This order surface is designed for operational oversight: customer context, business context, value, and status flow are all visible from one admin table."
        icon={ClipboardList}
      >
        <DashboardHeroPill
          icon={ClipboardList}
          label="Pending"
          value={`${summary.pending} in view`}
          note="Orders on this page that are still waiting for action."
        />
        <DashboardHeroPill
          icon={ShoppingBag}
          label="Confirmed"
          value={`${summary.confirmed} in view`}
          note="Orders already accepted and moving through fulfillment."
        />
        <DashboardHeroPill
          icon={CircleDot}
          label="Indexed"
          value={`${data?.total ?? 0} total`}
          note="The number of orders currently indexed in the admin directory."
        />
      </DashboardHero>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Pending in view" value={summary.pending} icon={ClipboardList} />
        <SummaryCard label="Confirmed in view" value={summary.confirmed} icon={ShoppingBag} />
        <SummaryCard label="Value in view" value={Math.round(summary.value)} icon={ClipboardList} />
      </div>

      <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-48px_rgba(15,37,64,0.7)]">
        <CardHeader>
          <CardTitle>Order Directory</CardTitle>
          <CardDescription>
            Use the admin order index to inspect customers, businesses, status flow, and total value without leaving the dashboard shell.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="size-4" />
              Order search is intentionally status-driven for now until a dedicated keyword contract is added.
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as StatusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full rounded-2xl border-border/70 bg-background/90 md:w-[180px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

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
                  <SelectValue placeholder="Sort orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">
                    <ArrowDownAZ data-icon="inline-start" />
                    Newest first
                  </SelectItem>
                  <SelectItem value="createdAt:asc">
                    <ArrowUpZA data-icon="inline-start" />
                    Oldest first
                  </SelectItem>
                  <SelectItem value="totalAmount:desc">
                    <ArrowUpZA data-icon="inline-start" />
                    Highest value
                  </SelectItem>
                  <SelectItem value="totalAmount:asc">
                    <ArrowDownAZ data-icon="inline-start" />
                    Lowest value
                  </SelectItem>
                  <SelectItem value="status:asc">
                    <ArrowDownAZ data-icon="inline-start" />
                    Status A-Z
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-border/70 bg-background/90">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/35">
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Businesses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-12 w-full rounded-xl" />
                        </TableCell>
                      </TableRow>
                    ))
                  : orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-primary/[0.03]">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{order.id.slice(0, 8)}...</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{order.customer.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {order.businesses.map((business) => business.businessName).join(', ')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          KES {order.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{order.itemCount}</TableCell>
                        <TableCell className="text-right">
                          <Button className="rounded-xl border-primary/15" variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Search data-icon="inline-start" />
                            Inspect
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>

            {!isLoading && orders.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No orders matched the current filters.
              </div>
            ) : null}
          </div>

          <PaginationBar
            page={data?.page ?? 1}
            totalPages={data?.totalPages ?? 1}
            pageNumbers={pageNumbers}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <AdminOrderDetailDialog
        order={selectedOrder}
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      />
    </AdminPageShell>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <Card className="overflow-hidden border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] shadow-[0_20px_50px_-42px_rgba(15,37,64,0.72)]">
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{value}</p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaginationBar({
  page,
  totalPages,
  pageNumbers,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-border/70 pt-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {Math.max(totalPages, 1)}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-border/70"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft data-icon="inline-start" />
          Previous
        </Button>
        {pageNumbers.map((pageNumber, index) => (
          <Button
            key={`orders-page-${pageNumber}-${index}`}
            variant={pageNumber === page ? 'default' : 'outline'}
            size="sm"
            className="rounded-xl"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-border/70"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Next
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
