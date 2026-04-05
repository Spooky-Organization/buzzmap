'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { api } from '@/lib/api';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  businessName: string;
}

interface CartData {
  items: CartItem[];
}

export default function CartPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [checkingOut, setCheckingOut] = useState(false);

  const { data, isLoading } = useQuery<CartData>({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/api/v1/cart');
      return { items: res.data.items ?? [] };
    },
    enabled: !!session,
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        await api.delete(`/api/v1/cart/items/${itemId}`);
      } else {
        await api.patch(`/api/v1/cart/items/${itemId}`, { quantity });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => toast.error('Failed to update cart'),
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/api/v1/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
    onError: () => toast.error('Failed to remove item'),
  });

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await api.post('/api/v1/orders/checkout');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Order placed successfully!');
    } catch {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const items = data?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">Your Cart</h1>
        <p className="text-muted-foreground">
          {isLoading ? '...' : `${items.length} item${items.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBag />
            </EmptyMedia>
            <EmptyTitle>Your cart is empty</EmptyTitle>
            <EmptyDescription>
              Browse products and add them to your cart
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<a href="/search" />}>Browse Products</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="flex flex-1 flex-col gap-3">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center gap-4">
                  <div className="size-16 shrink-0 rounded-lg bg-muted" />
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">{item.businessName}</p>
                    <p className="text-sm font-semibold text-primary">
                      ₱{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={updateQuantity.isPending}
                      onClick={() =>
                        updateQuantity.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                      }
                    >
                      <Minus />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={updateQuantity.isPending}
                      onClick={() =>
                        updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })
                      }
                    >
                      <Plus />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      disabled={removeItem.isPending}
                      onClick={() => removeItem.mutate(item.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="lg:w-80">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.productName} × {item.quantity}
                  </span>
                  <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={checkingOut || items.length === 0}
                onClick={handleCheckout}
              >
                {checkingOut && <Spinner data-icon="inline-start" />}
                {checkingOut ? 'Placing Order...' : 'Checkout'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
