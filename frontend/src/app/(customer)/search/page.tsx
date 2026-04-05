'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';

interface Business {
  id: string;
  name: string;
  category: string;
  location: string;
  logoUrl: string | null;
  rating: number | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  businessName: string;
  businessId: string;
}

interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

interface SearchResults {
  businesses: Business[];
  products: Product[];
  users: User[];
}

async function fetchSearchResults(query: string, category: string, location: string): Promise<SearchResults> {
  const res = await api.get<SearchResults>('/api/v1/search', {
    params: { q: query, category: category || undefined, location: location || undefined },
  });
  return res.data;
}

function ResultSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BusinessResult({ business }: { business: Business }) {
  return (
    <Link href={`/business/${business.id}`}>
      <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
        <div className="size-10 shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoUrl} alt={business.name} className="size-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-muted-foreground">
              {business.name[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-medium truncate">{business.name}</span>
          <span className="text-xs text-muted-foreground truncate">{business.location}</span>
        </div>
        <Badge variant="outline" className="ml-auto shrink-0">
          {business.category}
        </Badge>
      </div>
    </Link>
  );
}

function ProductResult({ product }: { product: Product }) {
  return (
    <Link href={`/business/${product.businessId}/products/${product.id}`}>
      <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
        <div className="size-10 shrink-0 rounded-lg bg-muted overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
          ) : (
            <div className="size-full bg-muted" />
          )}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-medium truncate">{product.name}</span>
          <span className="text-xs text-muted-foreground truncate">by {product.businessName}</span>
        </div>
        <span className="ml-auto shrink-0 text-sm font-semibold text-brand-amber">
          ₱{product.price.toFixed(2)}
        </span>
      </div>
    </Link>
  );
}

function UserResult({ user }: { user: User }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/profile/${user.id}`}>
      <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
        <Avatar size="sm">
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium truncate">{user.name}</span>
        <Badge variant="secondary" className="ml-auto shrink-0 capitalize">
          {user.role.toLowerCase().replace('_', ' ')}
        </Badge>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', debouncedQuery, category, location],
    queryFn: () => fetchSearchResults(debouncedQuery, category, location),
    enabled: debouncedQuery.trim().length > 0,
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold">Search</h1>

      {/* Search input */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search businesses, products, or people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
          autoFocus
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <Input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* No query state */}
      {!debouncedQuery.trim() && (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <p className="text-base font-medium">Start typing to search</p>
        </div>
      )}

      {/* Results */}
      {debouncedQuery.trim() && (
        <Tabs defaultValue="businesses">
          <TabsList className="mb-4">
            <TabsTrigger value="businesses">
              Businesses
              {data && (
                <Badge variant="secondary" className="ml-1.5">
                  {data.businesses.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="products">
              Products
              {data && (
                <Badge variant="secondary" className="ml-1.5">
                  {data.products.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">
              Users
              {data && (
                <Badge variant="secondary" className="ml-1.5">
                  {data.users.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {isLoading && <ResultSkeleton />}

          {isError && (
            <p className="text-sm text-destructive">Failed to load results. Please try again.</p>
          )}

          {data && (
            <>
              <TabsContent value="businesses">
                {data.businesses.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No businesses found</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.businesses.map((b) => (
                      <BusinessResult key={b.id} business={b} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="products">
                {data.products.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No products found</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.products.map((p) => (
                      <ProductResult key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="users">
                {data.users.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No users found</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.users.map((u) => (
                      <UserResult key={u.id} user={u} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      )}
    </div>
  );
}
