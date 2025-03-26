import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product, Order, UserProfile } from '@/types';

// Products hooks
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to fetch products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProducts(prev => [data as Product, ...prev]);
      toast.success('Product added successfully');
      return data;
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product');
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProducts(prev =>
        prev.map(product => (product.id === id ? { ...product, ...data } : product))
      );
      
      toast.success('Product updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setProducts(prev => prev.filter(product => product.id !== id));
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    // Set up realtime subscription
    const channel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};

// Orders hooks
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            products:product_id(*)
          ),
          user:user_id(
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data into the expected format
      const transformedOrders = data?.map((order) => {
        // Handle potentially null values safely
        const orderData = order as unknown as Order;
        return orderData;
      }) || [];

      setOrders(transformedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to fetch orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setOrders(prev =>
        prev.map(order => (order.id === id ? { ...order, status } : order))
      );
      
      toast.success(`Order status updated to ${status}`);
      return data;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription
    const channel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
  };
};

// User profiles hooks
export const useUserProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching user profiles:', error);
      setError(error.message || 'Failed to fetch user profiles');
      toast.error('Failed to load user profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();

    // Set up realtime subscription
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
  };
};

// This is the missing hook that was causing the error
export const useAdminData = () => {
  const { products, loading: productsLoading, error: productsError, fetchProducts, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, loading: ordersLoading, error: ordersError, fetchOrders, updateOrderStatus } = useOrders();
  const { profiles: userProfiles, loading: usersLoading, error: usersError, fetchProfiles } = useUserProfiles();

  // Transform user profiles to include order count
  const users = userProfiles.map(profile => ({
    ...profile,
    orderCount: orders.filter(order => order.user_id === profile.id).length
  }));

  // Calculate revenue statistics
  const calculateRevenue = () => {
    const total = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = orders
      .filter(order => new Date(order.created_at) >= today)
      .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = orders
      .filter(order => new Date(order.created_at) >= firstDayOfMonth)
      .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
    
    return {
      total,
      today: todayRevenue,
      monthly: monthlyRevenue
    };
  };

  return {
    // Products data
    products,
    productsLoading,
    productsError,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Orders data
    orders,
    ordersLoading,
    ordersError,
    fetchOrders,
    updateOrderStatus,
    
    // Users data
    users,
    usersLoading,
    usersError,
    fetchUsers: fetchProfiles,
    
    // Revenue statistics
    revenue: calculateRevenue()
  };
};

// Add this for the Profile page
export const useUserOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            products:product_id(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching user orders:', error);
      setError(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription if user is authenticated
    if (user?.id) {
      const channel = supabase
        .channel('orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchOrders, user?.id]);

  return { orders, loading, error };
};
