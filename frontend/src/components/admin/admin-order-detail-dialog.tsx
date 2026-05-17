'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

export function AdminOrderDetailDialog({
  order,
  open,
  onOpenChange,
}: {
  order: AdminOrderListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order Review</DialogTitle>
          <DialogDescription>
            Inspect order owner, involved businesses, value, and lifecycle timestamps within the admin shell.
          </DialogDescription>
        </DialogHeader>

        {!order ? null : (
          <div className="grid gap-6">
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-border/70">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>Order {order.id.slice(0, 8)}...</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Created {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Total" value={`KES ${order.totalAmount.toFixed(2)}`} />
                  <MetricCard label="Items" value={String(order.itemCount)} />
                  <MetricCard label="Updated" value={new Date(order.updatedAt).toLocaleDateString()} />
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-primary/[0.03]">
                <CardHeader>
                  <CardTitle>Customer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 rounded-2xl border border-border/70 bg-background px-4 py-3">
                  <p className="font-medium text-foreground">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Businesses in Order</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {order.businesses.map((business, index) => (
                  <div
                    key={`${business.id ?? business.businessName}-${index}`}
                    className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3"
                  >
                    <p className="font-medium text-foreground">{business.businessName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Business ID: {business.id ? `${business.id.slice(0, 8)}...` : 'Unavailable'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
