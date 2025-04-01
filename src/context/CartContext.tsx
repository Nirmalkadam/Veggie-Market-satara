
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { Product, CartItem, CartItems } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface CartContextType {
  items: CartItems;
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Function to check if a string is a valid UUID
const isValidUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

// Function to convert string IDs to UUID format if needed
const ensureValidUUID = (id: string): string => {
  if (!isValidUUID(id)) {
    // Remove any non-alphanumeric characters
    const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
    // Pad with zeros to ensure proper length
    const paddedId = cleanId.padStart(12, '0');
    // Generate a deterministic UUID based on the original ID
    const uuid = `00000000-0000-0000-0000-${paddedId}`;
    return uuid;
  }
  return id;
};

// Function to sanitize product for database compatibility
const sanitizeProduct = (product: Product): Product => {
  if (!product.id) return product;
  
  const sanitizedId = ensureValidUUID(product.id);
  
  return {
    ...product,
    id: sanitizedId
  };
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItems>([]);
  const { user } = useAuth();
  
  // Get the current user's ID or use 'guest' for non-logged in users
  const currentUserId = user?.id || 'guest';

  // Load cart from localStorage on initial render or when user changes
  useEffect(() => {
    const loadCart = () => {
      // Always reset the cart state first when user changes
      setItems([]);
      
      // Admin users should never see any cart items
      if (user?.isAdmin) return;
      
      const cartKey = `cart_${currentUserId}`;
      const savedCart = localStorage.getItem(cartKey);
      
      if (savedCart) {
        try {
          // Ensure all product IDs are valid UUIDs
          const parsedCart: CartItems = JSON.parse(savedCart);
          const validatedCart = parsedCart.map(item => ({
            ...item,
            product: sanitizeProduct(item.product)
          }));
          setItems(validatedCart);
        } catch (error) {
          console.error('Failed to parse saved cart:', error);
          localStorage.removeItem(cartKey);
        }
      }
    };
    
    loadCart();
  }, [currentUserId, user?.isAdmin]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Don't save cart for admin users
    if (user?.isAdmin) return;
    
    const cartKey = `cart_${currentUserId}`;
    
    if (items.length > 0) {
      localStorage.setItem(cartKey, JSON.stringify(items));
    } else {
      // Remove the cart entry if it's empty
      localStorage.removeItem(cartKey);
    }
  }, [items, currentUserId, user?.isAdmin]);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const addItem = (product: Product, quantity = 1) => {
    // Prevent admin users from adding items
    if (user?.isAdmin) {
      toast.error("Admin users cannot add items to cart");
      return;
    }
    
    // Ensure the product has a valid UUID
    const sanitizedProduct = sanitizeProduct(product);
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === sanitizedProduct.id);
      
      if (existingItem) {
        // Update existing item quantity
        const updatedItems = prevItems.map(item => 
          item.product.id === sanitizedProduct.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        toast.success(`Updated ${sanitizedProduct.name} quantity in cart`);
        return updatedItems;
      } else {
        // Add new item
        toast.success(`Added ${sanitizedProduct.name} to cart`);
        return [...prevItems, { product: sanitizedProduct, quantity }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.product.id === productId);
      if (itemToRemove) {
        toast.success(`Removed ${itemToRemove.product.name} from cart`);
      }
      
      return prevItems.filter(item => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(`cart_${currentUserId}`);
    toast.success('Cart cleared');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
