
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  unit: string; // kg, bunch, piece, etc.
  featured?: boolean;
  discount?: number;
  organic?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type CartItems = CartItem[];

export interface Order {
  id: string;
  user: User;
  items: CartItems;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

export type Category = 'vegetables' | 'fruits' | 'herbs' | 'roots' | 'greens' | 'all';

export interface SearchFilters {
  query: string;
  category: Category;
  minPrice?: number;
  maxPrice?: number;
  organic?: boolean;
}
