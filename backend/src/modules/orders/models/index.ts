import type { OrderStatus } from '@prisma/client';

export interface AddToCartDTO {
  productId: string;
  quantity?: number; // defaults to 1
}

export interface CartItemResponse {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    currency: string;
    images: string[];
    businessId: string;
    businessName: string;
  };
  quantity: number;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  businessId: string;
  businessName: string;
  quantity: number;
  price: number; // price at time of order
}

export interface OrderResponse {
  id: string;
  customerId: string;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  businessName?: string;
  items: OrderItemResponse[];
  createdAt: Date;
}

export interface PaginatedOrdersResult {
  data: OrderResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
