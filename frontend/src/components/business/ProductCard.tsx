import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCartIcon } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    images: string[];
    stockQuantity: number;
    category?: string;
  };
  compact?: boolean;
  className?: string;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, compact = false, className, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity === 0;

  if (compact) {
    return (
      <Card className={cn('group cursor-pointer overflow-hidden', className)}>
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <img
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <p className="font-medium text-sm truncate">{product.name}</p>
          <p className="text-sm font-semibold mt-1">
            {product.currency} {product.price.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('group overflow-hidden', className)}>
      <div className="aspect-square relative overflow-hidden rounded-t-lg">
        <img
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
        {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
          <Badge variant="warning" className="absolute top-2 right-2">
            Only {product.stockQuantity} left
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <p className="font-medium truncate">{product.name}</p>
        {product.category && (
          <p className="text-sm text-muted-foreground truncate">{product.category}</p>
        )}
        <p className="text-2xl font-bold mt-2">
          <span className="text-sm text-muted-foreground">{product.currency}</span>
          {product.price.toLocaleString()}
        </p>
        <Button
          className="w-full mt-3"
          size="sm"
          disabled={isOutOfStock}
          onClick={() => onAddToCart?.(product.id)}
        >
          <ShoppingCartIcon className="size-4 mr-2" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}
