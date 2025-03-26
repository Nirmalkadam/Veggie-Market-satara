export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  category: string | null;
  organic: boolean | null;
  unit: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type CartItems = CartItem[];

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string | null;
  products?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  payment_method: string | null;
  items?: OrderItem[];
  user?: {
    name: string;
    email: string;
  };
}

export interface UserProfile {
  id: string;
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  phone: string | null;
  created_at: string;
  is_admin: boolean | null;
  orderCount?: number;
}

export type Category = 'vegetables' | 'fruits' | 'herbs' | 'roots' | 'greens' | 'all';

export interface SearchFilters {
  query: string;
  category: Category;
  minPrice?: number;
  maxPrice?: number;
  organic?: boolean;
}

export interface WebsiteSettings {
  siteName: string;
  logo: string;
  currency: string;
  currencySymbol: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  features: {
    enableCOD: boolean;
    enableOnlinePayment: boolean;
    enableReviews: boolean;
  };
}
