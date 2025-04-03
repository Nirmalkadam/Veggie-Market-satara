
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface OrderActionsProps {
  orderId: string;
  orderStatus: string;
  onStatusChange: () => void;
  isAdminView?: boolean;
}

const OrderActions = ({ orderId, orderStatus, onStatusChange, isAdminView = false }: OrderActionsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(orderStatus);
  
  const handleCancelOrder = async () => {
    try {
      setIsUpdating(true);
      
      console.log("Cancelling order with ID:", orderId);
      
      // Check if the order ID is valid
      if (!orderId || typeof orderId !== 'string') {
        throw new Error('Invalid order ID');
      }
      
      const { error, data } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .select();
      
      console.log("Update response:", { error, data });
      
      if (error) {
        throw error;
      }
      
      toast.success('Order has been cancelled');
      onStatusChange();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateOrderStatus = async () => {
    try {
      setIsUpdating(true);
      
      console.log("Updating order status for ID:", orderId, "to", selectedStatus);
      
      // Check if the order ID is valid
      if (!orderId || typeof orderId !== 'string') {
        throw new Error('Invalid order ID');
      }
      
      const { error, data } = await supabase
        .from('orders')
        .update({ status: selectedStatus })
        .eq('id', orderId)
        .select();
      
      console.log("Update response:", { error, data });
      
      if (error) {
        throw error;
      }
      
      toast.success(`Order status updated to ${selectedStatus}`);
      onStatusChange();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };
  
  const canCancel = orderStatus !== 'cancelled' && orderStatus !== 'completed' && orderStatus !== 'delivered';
  const isAdmin = user?.isAdmin;
  
  return (
    <div className="flex flex-col md:flex-row gap-2">
      {isAdmin && isAdminView ? (
        <div className="flex flex-col md:flex-row gap-2 w-full">
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Button 
            variant="default" 
            size="default" 
            onClick={handleUpdateOrderStatus}
            disabled={isUpdating || selectedStatus === orderStatus}
            className="whitespace-nowrap"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      ) : (
        <>
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isUpdating}>
                  {isUpdating ? 'Cancelling...' : 'Cancel Order'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, keep order</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelOrder}>
                    Yes, cancel order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/products')}
          >
            Shop More
          </Button>
        </>
      )}
    </div>
  );
};

export default OrderActions;
