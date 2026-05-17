'use client';

import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Mail, MapPin, Package, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';

interface AdminBusinessListItem {
  id: string;
  businessName: string;
  description: string;
  category: string;
  type: string;
  location: string;
  isVerified: boolean;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  productCount: number;
  avgRating: number | null;
  reviewCount: number;
}

interface BusinessProfileResponse {
  id: string;
  businessName: string;
  description: string;
  category: string;
  type: string;
  location: string;
  contactInfo: string;
  isVerified: boolean;
}

interface ProductResponse {
  data: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    stock: number;
    isAvailable: boolean;
  }>;
}

export function AdminBusinessDetailDialog({
  business,
  open,
  onOpenChange,
}: {
  business: AdminBusinessListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['admin-business-profile', business?.id],
    queryFn: async () => {
      const res = await api.get<BusinessProfileResponse>(apiRoutes.business.byId(business!.id));
      return res.data;
    },
    enabled: open && !!business,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-business-products', business?.id],
    queryFn: async () => {
      const res = await api.get<ProductResponse>(apiRoutes.products.byBusiness(business!.id), {
        params: { page: 1, limit: 6 },
      });
      return res.data;
    },
    enabled: open && !!business,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Business Review</DialogTitle>
          <DialogDescription>
            Inspect owner, verification status, profile detail, and top catalog items without leaving the admin workspace.
          </DialogDescription>
        </DialogHeader>

        {!business ? null : (
          <div className="grid gap-6">
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="border-border/70">
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-semibold text-primary">{business.businessName}</h2>
                          <Badge variant={business.isVerified ? 'default' : 'outline'}>
                            {business.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {business.category} • {business.type}
                        </p>
                      </div>
                      <div className="grid gap-2 text-right text-sm text-muted-foreground">
                        <span className="flex items-center justify-end gap-2">
                          <MapPin className="size-4" />
                          {business.location}
                        </span>
                        <span className="flex items-center justify-end gap-2">
                          <Star className="size-4" />
                          {business.avgRating !== null ? business.avgRating.toFixed(1) : 'N/A'} across {business.reviewCount} reviews
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {profile?.description ?? business.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-primary/[0.03]">
                <CardHeader>
                  <CardTitle>Owner and Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                    <p className="font-medium text-foreground">{business.owner.name}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="size-4" />
                      {business.owner.email}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <BadgeCheck className="size-4 text-primary" />
                      Contact and commerce
                    </div>
                    {profileLoading ? (
                      <Skeleton className="mt-3 h-16 rounded-xl" />
                    ) : (
                      <div className="mt-3 grid gap-2">
                        <p>{profile?.contactInfo ?? 'Contact info not available'}</p>
                        <p>{business.productCount} products currently attached</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Recent Catalog Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {productsLoading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-28 rounded-2xl" />
                    ))
                  : (productsData?.data ?? []).map((product) => (
                      <div
                        key={product.id}
                        className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.currency} {product.price.toFixed(2)}
                            </p>
                          </div>
                          <Badge variant={product.isAvailable ? 'secondary' : 'outline'}>
                            {product.isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="size-4" />
                          Stock: {product.stock}
                        </p>
                      </div>
                    ))}
                {!productsLoading && (productsData?.data.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">No products found for this business.</p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
