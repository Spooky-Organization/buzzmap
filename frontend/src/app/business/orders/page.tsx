'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ChevronRight, ClipboardList, PackageCheck, ShoppingBag, Workflow } from 'lucide-react';
import { toast } from 'sonner';
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  customerName: string;
  items: OrderItem[];
}

function statusVariant(status: OrderStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'CONFIRMED':
      return 'default';
    case 'PENDING':
      return 'secondary';
    case 'COMPLETED':
      return 'outline';
    case 'CANCELLED':
      return 'destructive';
  }
}

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function BusinessOrdersPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery<{ orders: Order[] }>({
    queryKey: ['business-orders'],
    queryFn: async () => {
      const res = await api.get(apiRoutes.orders.business);
      return { orders: res.data.orders ?? [] };
    },
    enabled: !!session,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      await api.patch(apiRoutes.orders.updateStatus(id), { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const orders = data?.orders ?? [];
  const pending = orders.filter((order) => order.status === 'PENDING').length;
  const confirmed = orders.filter((order) => order.status === 'CONFIRMED').length;
  const totalValue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Business orders"
        title="Manage incoming orders without leaving the operator lane."
        description="Track order flow, update statuses quickly, and inspect line items from one fulfillment surface built for businesses."
        icon={Workflow}
      >
        <DashboardHeroPill
          icon={ClipboardList}
          label="Orders"
          value={`${orders.length} total`}
          note="All business orders currently returned from the order index."
        />
        <DashboardHeroPill
          icon={PackageCheck}
          label="Confirmed"
          value={`${confirmed} active`}
          note="Orders that are no longer pending and are moving through fulfillment."
        />
        <DashboardHeroPill
          icon={ShoppingBag}
          label="Value"
          value={`KES ${Math.round(totalValue)}`}
          note="Gross order value represented by the current order list."
        />
      </DashboardHero>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard
          label="Pending"
          value={String(pending)}
          note="New orders still awaiting confirmation."
          icon={ClipboardList}
          accent="from-amber-500/18 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Confirmed"
          value={String(confirmed)}
          note="Orders already accepted into fulfillment."
          icon={PackageCheck}
          accent="from-sky-500/15 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Order Value"
          value={`${Math.round(totalValue)}`}
          note="Rounded view of order value in the current dataset."
          icon={ShoppingBag}
          accent="from-emerald-500/15 via-primary/[0.08] to-transparent"
        />
      </div>

      <Card className="border-border/70 bg-card/80 shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
        <CardHeader>
          <CardTitle>Incoming Orders</CardTitle>
          <CardDescription>{isLoading ? '' : `${orders.length} orders`}</CardDescription>
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
                <EmptyDescription>Customer orders will appear here</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/35">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Update Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-primary/[0.03]">
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">KES {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          updateStatus.mutate({ id: order.id, status: value as OrderStatus })
                        }
                      >
                        <SelectTrigger size="sm" className="rounded-xl border-border/70 bg-background/90">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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
                              <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Customer</span>
                                  <span>{selectedOrder.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status</span>
                                  <Badge variant={statusVariant(selectedOrder.status)}>
                                    {selectedOrder.status}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Date</span>
                                  <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
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
                                    <span>KES {(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <Separator />
                              <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>KES {selectedOrder.total.toFixed(2)}</span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
