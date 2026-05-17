'use client';

import { use } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Clock,
  ImageIcon,
  MapPin,
  Navigation,
  Phone,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';

interface BusinessProfile {
  id: string;
  businessName: string;
  description: string;
  category: string;
  type: string;
  location: string;
  coordinates: string | null;
  contactInfo: string;
  operatingHours: Record<string, string> | null;
  logoUrl?: string;
  avgRating: number;
  reviewCount: number;
  followerCount: number;
  isFollowing: boolean;
}

interface Pov {
  id: string;
  caption: string | null;
  starRating: number;
  recommends: boolean;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  images?: string[];
}

function formatOperatingHours(operatingHours: BusinessProfile['operatingHours']): string | null {
  if (!operatingHours || typeof operatingHours !== 'object') return null;

  const entries = Object.entries(operatingHours).filter(([, value]) => Boolean(value));
  if (entries.length === 0) return null;

  return entries
    .map(([day, hours]) => `${day.slice(0, 1).toUpperCase()}${day.slice(1)}: ${hours}`)
    .join(' • ');
}

function formatCurrency(amount: number, currency = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function splitDescription(description: string): string[] {
  return description
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getGalleryImages(products: Product[]): string[] {
  const images = products.flatMap((product) => product.images ?? []).filter(Boolean);
  return Array.from(new Set(images)).slice(0, 3);
}

function getMapEmbedUrl(business: BusinessProfile): string | null {
  const query = business.coordinates?.trim() || business.location?.trim();
  if (!query) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

export default function BusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: business, isLoading: bizLoading } = useQuery<BusinessProfile>({
    queryKey: ['business-public', id],
    queryFn: async () => {
      const res = await api.get(apiRoutes.business.byId(id));
      return res.data;
    },
  });

  const { data: povsData } = useQuery<{ povs: Pov[] }>({
    queryKey: ['business-povs', id],
    queryFn: async () => {
      const res = await api.get(apiRoutes.pov.byBusiness(id), { params: { limit: 6 } });
      return { povs: res.data.data ?? [] };
    },
  });

  const { data: productsData } = useQuery<{ products: Product[] }>({
    queryKey: ['business-products-public', id],
    queryFn: async () => {
      const res = await api.get(apiRoutes.products.byBusiness(id), { params: { limit: 6 } });
      return { products: res.data.data ?? [] };
    },
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      if (business?.isFollowing) {
        await api.delete(apiRoutes.business.follow(id));
      } else {
        await api.post(apiRoutes.business.follow(id));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-public', id] });
      toast.success(business?.isFollowing ? 'Unfollowed' : 'Following');
    },
    onError: () => toast.error('Failed to update follow'),
  });

  const initials = (business?.businessName ?? '?')
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const operatingHoursText = formatOperatingHours(business?.operatingHours ?? null);
  const averageRating = business?.avgRating ?? 0;
  const products = productsData?.products ?? [];
  const galleryImages = getGalleryImages(products);
  const descriptionPoints = splitDescription(business?.description ?? '');
  const mapEmbedUrl = business ? getMapEmbedUrl(business) : null;

  if (bizLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-6">
        <Skeleton className="h-72 w-full" />
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-6">
      <Card className="overflow-hidden border-border/60">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <CardContent className="flex flex-col gap-5 p-5 md:p-7">
            <div className="flex items-start gap-4">
              <Avatar size="lg">
                {business.logoUrl && (
                  <AvatarImage src={business.logoUrl} alt={business.businessName} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-primary">
                      {business.businessName}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {business.category.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline">{business.type}</Badge>
                      <Badge variant="outline" className="gap-1">
                        <Sparkles className="size-3" />
                        Trust-first profile
                      </Badge>
                    </div>
                  </div>

                  {session && (
                    <Button
                      variant={business.isFollowing ? 'outline' : 'default'}
                      size="sm"
                      disabled={toggleFollow.isPending}
                      onClick={() => toggleFollow.mutate()}
                    >
                      {business.isFollowing ? (
                        <>
                          <UserCheck data-icon="inline-start" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus data-icon="inline-start" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-foreground">
                    <Star className="size-4 text-accent" />
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({business.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-foreground">
                    <Users className="size-4 text-muted-foreground" />
                    <span>{business.followerCount} followers</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-4 text-accent" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    About
                  </h2>
                </div>
                <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                  {descriptionPoints.length > 0 ? (
                    descriptionPoints.map((point, index) => (
                      <p key={`${business.id}-description-${index}`}>{point}</p>
                    ))
                  ) : (
                    <p>No business description available yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Navigation className="size-4 text-accent" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Contact
                  </h2>
                </div>
                <div className="space-y-3 rounded-2xl border bg-muted/30 p-4 text-sm">
                  {business.location && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="mt-0.5 size-4 shrink-0" />
                      <span>{business.location}</span>
                    </div>
                  )}
                  {business.contactInfo && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Phone className="mt-0.5 size-4 shrink-0" />
                      <span>{business.contactInfo}</span>
                    </div>
                  )}
                  {operatingHoursText && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Clock className="mt-0.5 size-4 shrink-0" />
                      <span>{operatingHoursText}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <div className="border-t bg-muted/20 p-5 lg:border-l lg:border-t-0">
            <div className="mb-3 flex items-center gap-2">
              <ImageIcon className="size-4 text-accent" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Business Photos
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
              {Array.from({ length: 3 }).map((_, index) => {
                const image = galleryImages[index];
                return (
                  <div
                    key={`${business.id}-gallery-${index}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-background"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={`${business.businessName} photo ${index + 1}`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
                        Add more showcase or product photos to complete this gallery
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b px-5 py-4">
              <h2 className="text-lg font-semibold text-primary">Location</h2>
              <p className="text-sm text-muted-foreground">
                Quick map context for where this business operates.
              </p>
            </div>
            {mapEmbedUrl ? (
              <iframe
                title={`${business.businessName} map`}
                src={mapEmbedUrl}
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                This business has not added map-ready coordinates or a strong location query yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col justify-center gap-3 p-5">
            <h2 className="text-lg font-semibold text-primary">Profile Completeness</h2>
            <p className="text-sm text-muted-foreground">
              High-trust business pages should include a strong description, map-ready location,
              and at least three photos.
            </p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-xl border px-3 py-2">
                Description: {descriptionPoints.length > 0 ? 'Complete' : 'Needs more detail'}
              </div>
              <div className="rounded-xl border px-3 py-2">
                Map: {mapEmbedUrl ? 'Location ready' : 'Missing coordinates or clear place query'}
              </div>
              <div className="rounded-xl border px-3 py-2">Photos: {galleryImages.length}/3 available</div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <p className="line-clamp-2 text-sm font-medium">
                      {pov.caption || `${pov.starRating}/5 star customer POV`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pov.recommends ? 'Recommended' : 'Not recommended'} •{' '}
                      {formatRelativeDate(pov.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {products.length === 0 ? (
              <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                No products listed yet
              </p>
            ) : (
              products.map((product) => (
                <Card key={product.id} size="sm" className="overflow-hidden">
                  <div className="aspect-[4/3] bg-muted/30">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <CardContent className="flex flex-col gap-2">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-primary">
                        {formatCurrency(product.price)}
                      </p>
                      <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                        {product.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
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
