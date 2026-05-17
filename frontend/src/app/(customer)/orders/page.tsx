'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ClipboardList, ChevronLeft, ChevronRight, PackageCheck, ShoppingBag, Workflow } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';
import {
  DashboardHero,
  DashboardHeroPill,
  DashboardMetricCard,
} from '@/components/dashboard/dashboard-surfaces';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  total: number;
  createdAt: string;
  businessName: string;
  items: OrderItem[];
}

interface OrdersData {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

function statusVariant(status: Order['status']): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'CONFIRMED': return 'default';
    case 'PENDING': return 'secondary';
    case 'COMPLETED': return 'outline';
    case 'CANCELLED': return 'destructive';
  }
}

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery<OrdersData>({
    queryKey: ['orders', page],
    queryFn: async () => {
      const res = await api.get(apiRoutes.orders.mine, {
        params: { page, limit: PAGE_SIZE },
      });
      return {
        orders: res.data.orders ?? [],
        total: res.data.total ?? 0,
        page: res.data.page ?? 1,
        totalPages: res.data.totalPages ?? 1,
      };
    },
    enabled: !!session,
  });

  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;
  const pending = orders.filter((order) => order.status === 'PENDING').length;
  const confirmed = orders.filter((order) => order.status === 'CONFIRMED').length;
  const totalValue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Customer orders"
        title="Track order history without losing the buyer context."
        description="Review past purchases, inspect line items, and monitor current statuses from one order surface designed for customers."
        icon={Workflow}
      >
        <DashboardHeroPill
          icon={ClipboardList}
          label="Orders"
          value={`${data?.total ?? 0} total`}
          note="All customer orders currently visible through the order history endpoint."
        />
        <DashboardHeroPill
          icon={PackageCheck}
          label="Confirmed"
          value={`${confirmed} in view`}
          note="Orders already moving beyond the pending state."
        />
        <DashboardHeroPill
          icon={ShoppingBag}
          label="Value"
          value={`KES ${Math.round(totalValue)}`}
          note="Rounded value represented by the current page of orders."
        />
      </DashboardHero>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard
          label="Pending"
          value={String(pending)}
          note="Orders still awaiting confirmation."
          icon={ClipboardList}
          accent="from-amber-500/18 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Confirmed"
          value={String(confirmed)}
          note="Orders that are actively progressing."
          icon={PackageCheck}
          accent="from-sky-500/15 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Value"
          value={`${Math.round(totalValue)}`}
          note="Rounded value of orders on the current page."
          icon={ShoppingBag}
          accent="from-emerald-500/15 via-primary/[0.08] to-transparent"
        />
      </div>

      <Card className="border-border/70 bg-card/80 shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {isLoading ? '' : `${data?.total ?? 0} orders total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardList />
                </EmptyMedia>
                <EmptyTitle>No orders yet</EmptyTitle>
                <EmptyDescription>
                  Your order history will appear here
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/35">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-primary/[0.03]">
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{order.businessName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₱{order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Dialog
                          open={selectedOrder?.id === order.id}
                          onOpenChange={(open) => !open && setSelectedOrder(null)}
                        >
                          <DialogTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setSelectedOrder(order)}
                              />
                            }
                          >
                            <ChevronRight />
                            <span className="sr-only">View details</span>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Order Details</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order ID</span>
                                    <span className="font-mono">{selectedOrder.id.slice(0, 8)}...</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Business</span>
                                    <span>{selectedOrder.businessName}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Date</span>
                                    <span>
                                      {new Date(selectedOrder.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant={statusVariant(selectedOrder.status)}>
                                      {selectedOrder.status}
                                    </Badge>
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex flex-col gap-2">
                                  <p className="text-sm font-medium">Items</p>
                                  {(selectedOrder.items ?? []).map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        {item.productName} × {item.quantity}
                                      </span>
                                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                  <span>Total</span>
                                  <span>₱{selectedOrder.total.toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft data-icon="inline-start" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight data-icon="inline-end" />
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
