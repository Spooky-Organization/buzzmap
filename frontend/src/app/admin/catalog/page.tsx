'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownAZ,
  ArrowUpZA,
  Boxes,
  CircleDot,
  ChevronLeft,
  ChevronRight,
  Search,
  Tag,
} from 'lucide-react';
import { AdminPageShell } from '@/components/admin/admin-page-shell';
import { AdminCatalogDetailDialog } from '@/components/admin/admin-catalog-detail-dialog';
import { DashboardHero, DashboardHeroPill } from '@/components/dashboard/dashboard-surfaces';
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
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';

type SortBy = 'name' | 'price' | 'createdAt' | 'stock';
type SortOrder = 'asc' | 'desc';
type AvailabilityFilter = 'all' | 'available' | 'unavailable';

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

interface CatalogResponse {
  data: AdminCatalogListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminCatalogPage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');
  const [selectedProduct, setSelectedProduct] = useState<AdminCatalogListItem | null>(null);
  const deferredKeyword = useDeferredValue(keyword);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-catalog', deferredKeyword, page, sortBy, sortOrder, availability],
    queryFn: async () => {
      const res = await api.get<CatalogResponse>(apiRoutes.admin.catalog, {
        params: {
          keyword: deferredKeyword || undefined,
          availability:
            availability === 'all' ? undefined : availability === 'available' ? 'true' : 'false',
          page,
          limit: 8,
          sortBy,
          sortOrder,
        },
      });
      return res.data;
    },
  });

  const products = data?.data ?? [];
  const summary = {
    categories: new Set(products.map((product) => product.category)).size,
    available: products.filter((product) => product.isAvailable).length,
    kes: products.filter((product) => product.currency === 'KES').length,
  };

  const pageNumbers = useMemo(() => {
    const totalPages = data?.totalPages ?? 1;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [data?.totalPages, page]);

  return (
    <AdminPageShell
      title="Catalog"
      description="Review searchable listings with backend-backed filters, sorting, and modal inspection inside the admin shell."
      status={`${data?.total ?? 0} searchable listings`}
    >
      <DashboardHero
        eyebrow="Catalog directory"
        title="Review marketplace listings through the new admin rebrand."
        description="Use the catalog surface to inspect searchable products, compare stock posture, and understand what customers can actually discover and buy."
        icon={Boxes}
      >
        <DashboardHeroPill
          icon={Boxes}
          label="Listings"
          value={`${products.length} in view`}
          note="Current-page listings visible in this filtered catalog slice."
        />
        <DashboardHeroPill
          icon={Tag}
          label="Categories"
          value={`${summary.categories} in view`}
          note="The number of distinct categories represented on this page."
        />
        <DashboardHeroPill
          icon={CircleDot}
          label="Indexed"
          value={`${data?.total ?? 0} total`}
          note="The full listing count currently reachable through the admin catalog."
        />
      </DashboardHero>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Listings in view" value={products.length} icon={Boxes} />
        <SummaryCard label="Categories in view" value={summary.categories} icon={Tag} />
        <SummaryCard label="KES listings in view" value={summary.kes} icon={Tag} />
      </div>

      <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-48px_rgba(15,37,64,0.7)]">
        <CardHeader>
          <CardTitle>Catalog Directory</CardTitle>
          <CardDescription>
            Search and sort current listings, then inspect item detail without leaving the admin workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
                placeholder="Search products by name or description"
                className="rounded-2xl border-border/70 bg-background/90 pl-9"
              />
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Select
                value={availability}
                onValueChange={(value) => {
                  setAvailability(value as AvailabilityFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full rounded-2xl border-border/70 bg-background/90 md:w-[170px]">
                  <SelectValue placeholder="Filter availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All listings</SelectItem>
                  <SelectItem value="available">Available only</SelectItem>
                  <SelectItem value="unavailable">Unavailable only</SelectItem>
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
                  <SelectValue placeholder="Sort listings" />
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
                  <SelectItem value="name:asc">
                    <ArrowDownAZ data-icon="inline-start" />
                    Name A-Z
                  </SelectItem>
                  <SelectItem value="name:desc">
                    <ArrowUpZA data-icon="inline-start" />
                    Name Z-A
                  </SelectItem>
                  <SelectItem value="price:asc">
                    <ArrowDownAZ data-icon="inline-start" />
                    Lowest price
                  </SelectItem>
                  <SelectItem value="price:desc">
                    <ArrowUpZA data-icon="inline-start" />
                    Highest price
                  </SelectItem>
                  <SelectItem value="stock:desc">
                    <ArrowUpZA data-icon="inline-start" />
                    Highest stock
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-border/70 bg-background/90">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/35">
                  <TableHead>Listing</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
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
                  : products.map((product) => (
                      <TableRow key={product.id} className="hover:bg-primary/[0.03]">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(product.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.business.businessName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{product.category}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.currency} {product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{product.stock}</TableCell>
                        <TableCell>
                          <Badge variant={product.isAvailable ? 'secondary' : 'outline'}>
                            {product.isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button className="rounded-xl border-primary/15" variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                            <Search data-icon="inline-start" />
                            Inspect
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>

            {!isLoading && products.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No listings matched the current filters.
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

      <AdminCatalogDetailDialog
        product={selectedProduct}
        open={selectedProduct !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
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
            key={`catalog-page-${pageNumber}-${index}`}
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
