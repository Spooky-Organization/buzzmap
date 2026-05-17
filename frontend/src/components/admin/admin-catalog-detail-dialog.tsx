'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AdminCatalogListItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  business: {
    id: string;
    businessName: string;
    category: string;
    location: string;
  };
}

export function AdminCatalogDetailDialog({
  product,
  open,
  onOpenChange,
}: {
  product: AdminCatalogListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Catalog Item Review</DialogTitle>
          <DialogDescription>
            Review listing detail and its attached business without leaving the admin catalog workspace.
          </DialogDescription>
        </DialogHeader>

        {!product ? null : (
          <div className="grid gap-6">
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-border/70">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{product.name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <Badge variant={product.isAvailable ? 'secondary' : 'outline'}>
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricCard label="Price" value={`${product.currency} ${product.price.toFixed(2)}`} />
                    <MetricCard label="Stock" value={String(product.stock)} />
                    <MetricCard label="Created" value={new Date(product.createdAt).toLocaleDateString()} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-primary/[0.03]">
                <CardHeader>
                  <CardTitle>Attached Business</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                    <p className="font-medium text-foreground">{product.business.businessName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{product.business.category}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{product.business.location}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
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
