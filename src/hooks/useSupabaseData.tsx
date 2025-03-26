
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SupabaseDataOptions = {
  realtime?: boolean;
  realtimeEvents?: ('INSERT' | 'UPDATE' | 'DELETE')[];
}

export function useSupabaseData<T>(
  tableName: string, 
  options: SupabaseDataOptions = { realtime: true, realtimeEvents: ['INSERT', 'UPDATE', 'DELETE'] }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: fetchedData, error: fetchError } = await supabase
        .from(tableName)
        .select('*');
      
      if (fetchError) {
        throw fetchError;
      }
      
      setData(fetchedData || []);
      setError(null);
    } catch (err: any) {
      console.error(`Error fetching ${tableName}:`, err);
      setError(err.message || `Failed to fetch ${tableName}`);
      toast.error(`Failed to load ${tableName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add new item function
  const addItem = async (newItem: Partial<T>) => {
    try {
      const { data: insertedData, error: insertError } = await supabase
        .from(tableName)
        .insert(newItem)
        .select('*')
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      if (!options.realtime) {
        setData(prev => [...prev, insertedData as T]);
      }
      
      return { data: insertedData, error: null };
    } catch (err: any) {
      console.error(`Error adding to ${tableName}:`, err);
      toast.error(`Failed to add to ${tableName}: ${err.message}`);
      return { data: null, error: err };
    }
  };

  // Update item function
  const updateItem = async (id: string | number, updates: Partial<T>) => {
    try {
      const { data: updatedData, error: updateError } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      if (!options.realtime) {
        setData(prev => prev.map(item => (item as any).id === id ? updatedData as T : item));
      }
      
      return { data: updatedData, error: null };
    } catch (err: any) {
      console.error(`Error updating ${tableName}:`, err);
      toast.error(`Failed to update ${tableName}: ${err.message}`);
      return { data: null, error: err };
    }
  };

  // Delete item function
  const deleteItem = async (id: string | number) => {
    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      if (!options.realtime) {
        setData(prev => prev.filter(item => (item as any).id !== id));
      }
      
      return { error: null };
    } catch (err: any) {
      console.error(`Error deleting from ${tableName}:`, err);
      toast.error(`Failed to delete from ${tableName}: ${err.message}`);
      return { error: err };
    }
  };

  // Set up initial data fetch and realtime subscription
  useEffect(() => {
    fetchData();
    
    // Set up realtime subscription if enabled
    if (options.realtime) {
      const channel = supabase
        .channel(`public:${tableName}`)
        .on('postgres_changes', {
          event: options.realtimeEvents || ['INSERT', 'UPDATE', 'DELETE'],
          schema: 'public',
          table: tableName
        }, (payload) => {
          console.log('Realtime update received:', payload);
          
          // Handle different event types
          if (payload.eventType === 'INSERT') {
            setData(prev => [...prev, payload.new as T]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => 
              prev.map(item => (item as any).id === payload.new.id ? payload.new as T : item)
            );
          } else if (payload.eventType === 'DELETE') {
            setData(prev => 
              prev.filter(item => (item as any).id !== payload.old.id)
            );
          }
        })
        .subscribe();
      
      // Cleanup subscription on component unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [tableName]);

  return {
    data,
    loading,
    error,
    fetchData,
    addItem,
    updateItem,
    deleteItem
  };
}

export function useSupabaseItem<T>(
  tableName: string,
  id: string | null,
  options: SupabaseDataOptions = { realtime: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState<string | null>(null);

  // Fetch single item function
  const fetchItem = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const { data: fetchedData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      setData(fetchedData as T);
      setError(null);
    } catch (err: any) {
      console.error(`Error fetching ${tableName} item:`, err);
      setError(err.message || `Failed to fetch ${tableName} item`);
      toast.error(`Failed to load item: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update item function
  const updateItem = async (updates: Partial<T>) => {
    if (!id) return { data: null, error: new Error('No ID provided') };
    
    try {
      const { data: updatedData, error: updateError } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      if (!options.realtime) {
        setData(updatedData as T);
      }
      
      return { data: updatedData, error: null };
    } catch (err: any) {
      console.error(`Error updating ${tableName} item:`, err);
      toast.error(`Failed to update item: ${err.message}`);
      return { data: null, error: err };
    }
  };

  // Set up initial fetch and realtime subscription
  useEffect(() => {
    if (id) {
      fetchItem();
      
      // Set up realtime subscription for this item if enabled
      if (options.realtime) {
        const channel = supabase
          .channel(`public:${tableName}:id=eq.${id}`)
          .on('postgres_changes', {
            event: ['UPDATE', 'DELETE'],
            schema: 'public',
            table: tableName,
            filter: `id=eq.${id}`
          }, (payload) => {
            console.log('Item realtime update:', payload);
            
            if (payload.eventType === 'UPDATE') {
              setData(payload.new as T);
            } else if (payload.eventType === 'DELETE') {
              setData(null);
            }
          })
          .subscribe();
        
        return () => {
          supabase.removeChannel(channel);
        };
      }
    } else {
      setData(null);
      setLoading(false);
    }
  }, [id, tableName]);

  return {
    data,
    loading,
    error,
    fetchItem,
    updateItem
  };
}

export function useUserOrders(userId: string | null) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(userId !== null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      if (!ordersData?.length) {
        setOrders([]);
        return;
      }
      
      // For each order, fetch order items with product details
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              id,
              quantity,
              price,
              products (
                id,
                name,
                image,
                unit
              )
            `)
            .eq('order_id', order.id);
          
          if (itemsError) throw itemsError;
          
          return {
            ...order,
            items: orderItems || []
          };
        })
      );
      
      setOrders(ordersWithItems);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching user orders:', err);
      setError(err.message || 'Failed to fetch orders');
      toast.error(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Set up initial fetch and realtime subscription
  useEffect(() => {
    if (userId) {
      fetchOrders();
      
      // Set up realtime subscription for orders
      const channel = supabase
        .channel(`public:orders:user_id=eq.${userId}`)
        .on('postgres_changes', {
          event: ['INSERT', 'UPDATE', 'DELETE'],
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          console.log('Orders realtime update:', payload);
          // Refresh the full orders list with items when there's a change
          fetchOrders();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [userId]);

  return {
    orders,
    loading,
    error,
    fetchOrders
  };
}

export function useAdminData() {
  // Products
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
    fetchData: fetchProducts,
    addItem: addProduct,
    updateItem: updateProduct,
    deleteItem: deleteProduct
  } = useSupabaseData('products');

  // Orders with related data
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Users
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Revenue calculations
  const [revenue, setRevenue] = useState({
    total: 0,
    today: 0,
    monthly: 0
  });

  // Fetch complex orders data with user info
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      
      // First fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Fetch user info for each order
      const ordersWithUserInfo = await Promise.all(
        (ordersData || []).map(async (order) => {
          try {
            // Get user profile
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('name, email:id')
              .eq('id', order.user_id)
              .single();
            
            if (userError) throw userError;
            
            // Get order items with product info
            const { data: orderItems, error: itemsError } = await supabase
              .from('order_items')
              .select(`
                id,
                quantity,
                price,
                products (
                  id,
                  name,
                  image,
                  unit
                )
              `)
              .eq('order_id', order.id);
            
            if (itemsError) throw itemsError;
            
            return {
              ...order,
              user: userData,
              items: orderItems || []
            };
          } catch (err) {
            console.error(`Error fetching details for order ${order.id}:`, err);
            return {
              ...order,
              user: { name: 'Unknown User', email: 'unknown' },
              items: []
            };
          }
        })
      );
      
      setOrders(ordersWithUserInfo);
      setOrdersError(null);
      
      // Calculate revenue statistics
      calculateRevenue(ordersWithUserInfo);
      
    } catch (err: any) {
      console.error('Error fetching orders with user info:', err);
      setOrdersError(err.message || 'Failed to fetch orders');
      toast.error(`Failed to load orders: ${err.message}`);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch users with order count
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Count orders for each user
      const usersWithOrderCount = await Promise.all(
        (profilesData || []).map(async (profile) => {
          try {
            const { count, error: countError } = await supabase
              .from('orders')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id);
            
            if (countError) throw countError;
            
            return {
              ...profile,
              orderCount: count || 0
            };
          } catch (err) {
            console.error(`Error counting orders for user ${profile.id}:`, err);
            return {
              ...profile,
              orderCount: 0
            };
          }
        })
      );
      
      setUsers(usersWithOrderCount);
      setUsersError(null);
    } catch (err: any) {
      console.error('Error fetching users with order count:', err);
      setUsersError(err.message || 'Failed to fetch users');
      toast.error(`Failed to load users: ${err.message}`);
    } finally {
      setUsersLoading(false);
    }
  };

  // Calculate revenue metrics
  const calculateRevenue = (ordersData: any[]) => {
    const total = ordersData.reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRevenue = ordersData
      .filter(order => new Date(order.created_at) >= today)
      .reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = ordersData
      .filter(order => new Date(order.created_at) >= startOfMonth)
      .reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    setRevenue({
      total,
      today: todayRevenue,
      monthly: monthlyRevenue
    });
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // If not catching the update via realtime, update the local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...data } : order
      ));
      
      toast.success(`Order #${orderId} status updated to ${status}`);
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating order status:', err);
      toast.error(`Failed to update order: ${err.message}`);
      return { data: null, error: err };
    }
  };

  // Set up initial fetch and realtime subscription
  useEffect(() => {
    fetchOrders();
    fetchUsers();
    
    // Set up realtime subscription for orders
    const ordersChannel = supabase
      .channel('admin-orders-changes')
      .on('postgres_changes', {
        event: ['INSERT', 'UPDATE', 'DELETE'],
        schema: 'public',
        table: 'orders'
      }, () => {
        // Refresh full order list with related data on any change
        fetchOrders();
      })
      .subscribe();
    
    // Set up realtime subscription for profiles
    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on('postgres_changes', {
        event: ['INSERT', 'UPDATE', 'DELETE'],
        schema: 'public',
        table: 'profiles'
      }, () => {
        // Refresh the users list
        fetchUsers();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  return {
    // Products
    products,
    productsLoading,
    productsError,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Orders
    orders,
    ordersLoading,
    ordersError,
    fetchOrders,
    updateOrderStatus,
    
    // Users
    users,
    usersLoading,
    usersError,
    fetchUsers,
    
    // Revenue
    revenue
  };
}
