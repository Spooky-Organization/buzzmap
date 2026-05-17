'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownAZ,
  ArrowUpZA,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Search,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { AdminPageShell } from '@/components/admin/admin-page-shell';
import { AdminBusinessDetailDialog } from '@/components/admin/admin-business-detail-dialog';
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

type SortBy = 'businessName' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type VerificationFilter = 'all' | 'verified' | 'unverified';

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

interface BusinessResponse {
  data: AdminBusinessListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminBusinessesPage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<AdminBusinessListItem | null>(null);
  const deferredKeyword = useDeferredValue(keyword);

  const { data, isLoading } = useQuery({
    queryKey: [
      'admin-businesses',
      deferredKeyword,
      page,
      sortBy,
      sortOrder,
      verificationFilter,
    ],
    queryFn: async () => {
      const res = await api.get<BusinessResponse>(apiRoutes.admin.businesses, {
        params: {
          keyword: deferredKeyword || undefined,
          verified:
            verificationFilter === 'all'
              ? undefined
              : verificationFilter === 'verified'
                ? 'true'
                : 'false',
          page,
          limit: 8,
          sortBy,
          sortOrder,
        },
      });
      return res.data;
    },
  });

  const businesses = data?.data ?? [];
  const summary = {
    verified: businesses.filter((business) => business.isVerified).length,
    unverified: businesses.filter((business) => !business.isVerified).length,
    rated: businesses.filter((business) => business.reviewCount > 0).length,
  };

  const pageNumbers = useMemo(() => {
    const totalPages = data?.totalPages ?? 1;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [data?.totalPages, page]);

  return (
    <AdminPageShell
      title="Businesses"
      description="Review supply-side profiles in a sortable admin directory with verification filtering and in-shell business inspection."
      status={`${data?.total ?? 0} indexed businesses`}
    >
      <DashboardHero
        eyebrow="Business directory"
        title="Inspect marketplace supply with the same control-plane language."
        description="This surface is for operator review of business quality, verification state, and public-facing supply health. Search, sort, and inspect without leaving the admin shell."
        icon={BadgeCheck}
      >
        <DashboardHeroPill
          icon={BadgeCheck}
          label="Verified"
          value={`${summary.verified} in view`}
          note="Businesses on the current page that already passed verification."
        />
        <DashboardHeroPill
          icon={ShieldAlert}
          label="Needs review"
          value={`${summary.unverified} in view`}
          note="Profiles still waiting for verification or manual review."
        />
        <DashboardHeroPill
          icon={CircleDot}
          label="Indexed"
          value={`${data?.total ?? 0} total`}
          note="The full number of business profiles currently indexed in admin."
        />
      </DashboardHero>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Verified in view" value={summary.verified} icon={BadgeCheck} />
        <SummaryCard label="Needs review in view" value={summary.unverified} icon={ShieldAlert} />
        <SummaryCard label="Rated in view" value={summary.rated} icon={Star} />
      </div>

      <Card className="border-border/70 bg-card/80 shadow-[0_24px_70px_-48px_rgba(15,37,64,0.7)]">
        <CardHeader>
          <CardTitle>Business Directory</CardTitle>
          <CardDescription>
            Search, filter, sort, and inspect business profiles without leaving the admin layout.
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
                placeholder="Search businesses or owners"
                className="rounded-2xl border-border/70 bg-background/90 pl-9"
              />
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Select
                value={verificationFilter}
                onValueChange={(value) => {
                  setVerificationFilter(value as VerificationFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full rounded-2xl border-border/70 bg-background/90 md:w-[180px]">
                  <SelectValue placeholder="Filter verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All businesses</SelectItem>
                  <SelectItem value="verified">Verified only</SelectItem>
                  <SelectItem value="unverified">Needs review only</SelectItem>
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
                  <SelectValue placeholder="Sort businesses" />
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
                  <SelectItem value="businessName:asc">
                    <ArrowDownAZ data-icon="inline-start" />
                    Name A-Z
                  </SelectItem>
                  <SelectItem value="businessName:desc">
                    <ArrowUpZA data-icon="inline-start" />
                    Name Z-A
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-border/70 bg-background/90">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/35">
                  <TableHead>Business</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Products</TableHead>
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
                  : businesses.map((business) => (
                      <TableRow key={business.id} className="hover:bg-primary/[0.03]">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{business.businessName}</p>
                            <p className="text-xs text-muted-foreground">
                              {business.location} • {business.type}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{business.owner.name}</TableCell>
                        <TableCell className="text-muted-foreground">{business.category}</TableCell>
                        <TableCell>
                          <Badge variant={business.isVerified ? 'default' : 'outline'}>
                            {business.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {business.avgRating !== null ? business.avgRating.toFixed(1) : 'N/A'} ({business.reviewCount})
                        </TableCell>
                        <TableCell className="text-muted-foreground">{business.productCount}</TableCell>
                        <TableCell className="text-right">
                          <Button className="rounded-xl border-primary/15" variant="outline" size="sm" onClick={() => setSelectedBusiness(business)}>
                            <Search data-icon="inline-start" />
                            Inspect
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>

            {!isLoading && businesses.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No businesses matched the current filters.
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

      <AdminBusinessDetailDialog
        business={selectedBusiness}
        open={selectedBusiness !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedBusiness(null);
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
            key={`businesses-page-${pageNumber}-${index}`}
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
