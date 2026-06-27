export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  currency?: string; // defaults to "KES"
  stock: number;
  category: string;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  isAvailable?: boolean;
}

export interface ProductResponse {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[]; // browser-loadable URLs (signed or absolute)
  imageKeys: string[]; // raw stored references (keys or absolute URLs) for edit
  stock: number;
  category: string;
  isAvailable: boolean;
  createdAt: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
