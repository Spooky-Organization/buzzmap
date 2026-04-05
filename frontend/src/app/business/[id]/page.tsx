'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  Heart,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';

interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  location: string;
  contact: string;
  website: string;
  operatingHours: string;
  logoUrl?: string;
  averageRating: number;
  reviewCount: number;
  followerCount: number;
  isFollowing: boolean;
}

interface Pov {
  id: string;
  title: string;
  viewCount: number;
  thumbnailUrl?: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  imageUrl?: string;
}

export default function BusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: business, isLoading: bizLoading } = useQuery<BusinessProfile>({
    queryKey: ['business-public', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/business/${id}`);
      return res.data;
    },
  });

  const { data: povsData } = useQuery<{ povs: Pov[] }>({
    queryKey: ['business-povs', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/pov/business/${id}`);
      return { povs: res.data.povs ?? [] };
    },
  });

  const { data: productsData } = useQuery<{ products: Product[] }>({
    queryKey: ['business-products-public', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/products/business/${id}`);
      return { products: res.data.products ?? [] };
    },
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      if (business?.isFollowing) {
        await api.delete(`/api/v1/business/${id}/follow`);
      } else {
        await api.post(`/api/v1/business/${id}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-public', id] });
      toast.success(business?.isFollowing ? 'Unfollowed' : 'Following');
    },
    onError: () => toast.error('Failed to update follow'),
  });

  const initials = (business?.name ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (bizLoading) {
    return (
      <div className="mx-auto max-w-2xl flex flex-col gap-6 p-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Business not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6 p-4">
      {/* Business Info */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-start gap-4">
            <Avatar size="lg">
              {business.logoUrl && (
                <AvatarImage src={business.logoUrl} alt={business.name} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-xl font-bold text-primary">{business.name}</h1>
                {session && (
                  <Button
                    variant={business.isFollowing ? 'outline' : 'default'}
                    size="sm"
                    disabled={toggleFollow.isPending}
                    onClick={() => toggleFollow.mutate()}
                  >
                    {business.isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {business.category.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline">{business.type}</Badge>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{business.description}</p>

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="size-4 text-accent" />
              <span className="font-medium">{business.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({business.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="size-4 text-muted-foreground" />
              <span>{business.followerCount} followers</span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2 text-sm">
            {business.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span>{business.location}</span>
              </div>
            )}
            {business.contact && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span>{business.contact}</span>
              </div>
            )}
            {business.website && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="size-4 shrink-0" />
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  {business.website}
                </a>
              </div>
            )}
            {business.operatingHours && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>{business.operatingHours}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="povs">
        <TabsList>
          <TabsTrigger value="povs">POVs</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="povs">
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(povsData?.povs ?? []).length === 0 ? (
              <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                No POVs yet
              </p>
            ) : (
              povsData?.povs.map((pov) => (
                <Card key={pov.id} size="sm">
                  <CardContent className="flex flex-col gap-1">
                    <p className="line-clamp-1 text-sm font-medium">{pov.title}</p>
                    <p className="text-xs text-muted-foreground">{pov.viewCount} views</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(productsData?.products ?? []).length === 0 ? (
              <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                No products listed
              </p>
            ) : (
              productsData?.products.map((product) => (
                <Card key={product.id} size="sm">
                  <CardContent className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-sm font-bold text-primary">
                        ₱{product.price.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
