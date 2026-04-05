export interface RegisterCustomerDTO {
  email: string;
  phone?: string;
  password: string;
  name: string;
  interests?: string[];
  location?: string;
}

export interface RegisterBusinessDTO {
  email: string;
  phone?: string;
  password: string;
  name: string;
  businessName: string;
  description: string;
  category: string;
  type: 'PRODUCTS' | 'SERVICES';
  location: string;
  coordinates?: string;
  contactInfo: string;
  operatingHours: import('@prisma/client').Prisma.InputJsonValue;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}
