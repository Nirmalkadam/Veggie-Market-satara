
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderActionsProps {
  orderId: string;
  orderStatus: string;
  onStatusChange: () => void;
}

const OrderActions = ({ orderId, orderStatus, onStatusChange }: OrderActionsProps) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  
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
  
  const canCancel = orderStatus !== 'cancelled' && orderStatus !== 'completed';
  
  return (
    <div className="flex space-x-2">
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
    </div>
  );
};

export default OrderActions;
