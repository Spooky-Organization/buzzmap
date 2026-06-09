'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, MoreVertical, Store, PackagePlus, Save, Boxes, Tag, ClipboardList, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';
import {
  DashboardHero,
  DashboardHeroPill,
  DashboardMetricCard,
} from '@/components/dashboard/dashboard-surfaces';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  category: string;
  isAvailable: boolean;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
}

const emptyForm: ProductForm = { name: '', description: '', price: '', stock: '', category: '' };

export default function ShelfPage() {
  const { data: session } = useSession();
  const isBusinessOwner = session?.user.role === 'BUSINESS_OWNER';
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const { data, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ['business-products'],
    queryFn: async () => {
      const res = await api.get(apiRoutes.products.businessMine);
      return { products: res.data.data ?? [] };
    },
    enabled: isBusinessOwner,
  });

  const buildProductPayload = () => {
    const name = form.name.trim();
    const description = form.description.trim();
    const category = form.category.trim();
    const price = Number.parseFloat(form.price);
    const stock = Number.parseInt(form.stock, 10);

    if (!name || !description || !category) {
      throw new Error('Name, description, and category are required.');
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Enter a valid price greater than zero.');
    }

    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error('Enter a valid stock quantity of zero or more.');
    }

    return { name, description, category, price, stock };
  };

  const saveProduct = useMutation({
    mutationFn: async () => {
      const payload = buildProductPayload();
      if (editingProduct) {
        await api.patch(apiRoutes.products.byId(editingProduct.id), payload);
      } else {
        await api.post(apiRoutes.products.root, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-products'] });
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingProduct(null);
      toast.success(editingProduct ? 'Product updated' : 'Product added');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to save product';
      toast.error(message);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(apiRoutes.products.byId(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-products'] });
      toast.success('Product removed');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      await api.patch(apiRoutes.products.byId(id), { isAvailable });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['business-products'] }),
    onError: () => toast.error('Failed to update availability'),
  });

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
    });
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const products = data?.products ?? [];
  const availableCount = products.filter((product) => product.isAvailable).length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Product shelf"
        title="Curate the storefront inventory like a real shelf."
        description="Manage listings, availability, and stock from one shelf-focused page that supports public discovery and order readiness."
        icon={Boxes}
      >
        <DashboardHeroPill
          icon={Store}
          label="Listings"
          value={`${products.length} products`}
          note="The current number of products attached to this business."
        />
        <DashboardHeroPill
          icon={Tag}
          label="Availability"
          value={`${availableCount} visible`}
          note="Products currently marked available to customers."
        />
      </DashboardHero>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard
          label="Products"
          value={String(products.length)}
          note="Inventory items currently attached to the business."
          icon={Store}
          accent="from-sky-500/15 via-primary/[0.08] to-transparent"
        />
        <DashboardMetricCard
          label="Available"
          value={String(availableCount)}
          note="Products customers can actively order right now."
          icon={Tag}
          accent="from-emerald-500/15 via-primary/[0.08] to-transparent"
          href={appRoutes.business.orders}
        />
        <DashboardMetricCard
          label="Stock"
          value={String(totalStock)}
          note="Total stock represented across shelf products."
          icon={Boxes}
          accent="from-amber-500/18 via-primary/[0.08] to-transparent"
        />
      </div>

      <Card className="border-border/70 bg-card/80 shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-primary">Keep shelf and fulfillment aligned</p>
            <p className="text-sm text-muted-foreground">
              Move from inventory updates into orders and customer conversations without leaving the business workflow.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" nativeButton={false} render={<Link href={appRoutes.business.orders} />}>
              <ClipboardList data-icon="inline-start" />
              Open orders
            </Button>
            <Button nativeButton={false} render={<Link href={appRoutes.business.messages} />}>
              <MessageSquare data-icon="inline-start" />
              Open messages
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-primary">Product Shelf</h1>
          <p className="text-muted-foreground">Manage your products</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button onClick={openAdd} />}>
            <Plus data-icon="inline-start" />
            Add Product
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Product Name</FieldLabel>
                <Input
                  placeholder="e.g. Honey Latte"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  placeholder="Product description..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Input
                  placeholder="e.g. Beverages"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Price (KES)</FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </Field>
                <Field>
                  <FieldLabel>Stock</FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  />
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter>
              <Button
                disabled={
                  saveProduct.isPending ||
                  !form.name.trim() ||
                  !form.description.trim() ||
                  !form.category.trim() ||
                  !form.price.trim() ||
                  !form.stock.trim()
                }
                onClick={() => saveProduct.mutate()}
              >
                {saveProduct.isPending ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </>
                ) : editingProduct ? (
                  <>
                    <Save data-icon="inline-start" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <PackagePlus data-icon="inline-start" />
                    Add Product
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Store />
            </EmptyMedia>
            <EmptyTitle>No products yet</EmptyTitle>
            <EmptyDescription>Add your first product to get started</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={openAdd}>
              <Plus data-icon="inline-start" />
              Add Product
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="border-border/70 bg-card/80 shadow-[0_18px_50px_-42px_rgba(15,37,64,0.65)]">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreVertical />
                      <span className="sr-only">Actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => openEdit(product)}>
                          <Edit />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleAvailability.mutate({
                              id: product.id,
                              isAvailable: !product.isAvailable,
                            })
                          }
                        >
                          {product.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => deleteProduct.mutate(product.id)}
                        >
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {product.currency} {product.price.toFixed(2)}
                  </span>
                  <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                    {product.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Category: {product.category}
                </p>
                <p className="text-sm text-muted-foreground">
                  Stock: {product.stock}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
