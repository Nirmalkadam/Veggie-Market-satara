import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  CreditCard, 
  Check,
  AlertCircle,
  Lock
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  address: z.string().min(5, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  zipCode: z.string().min(5, { message: 'ZIP Code is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
  paymentMethod: z.enum(['credit_card', 'paypal']),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  saveInformation: z.boolean().optional(),
  sameAsShipping: z.boolean().optional(),
}).refine((data) => {
  if (data.paymentMethod === 'credit_card') {
    return !!data.cardNumber && !!data.cardName && !!data.cardExpiry && !!data.cardCvv;
  }
  return true;
}, {
  message: 'Credit card information is required',
  path: ['cardNumber'],
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal'>('credit_card');

  const taxRate = 0.18; // 18% GST for India
  const estimatedTax = subtotal * taxRate;
  const shippingThreshold = 1000; // ₹1000
  const shippingCost = subtotal >= shippingThreshold ? 0 : 99; // ₹99 for shipping
  const total = subtotal + estimatedTax + shippingCost;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.name.split(' ')[0] || '',
      lastName: user?.name.split(' ')[1] || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      paymentMethod: 'credit_card',
      saveInformation: false,
      sameAsShipping: false,
    },
  });

  const watchPaymentMethod = form.watch('paymentMethod');
  const watchSameAsShipping = form.watch('sameAsShipping');

  useEffect(() => {
    setPaymentMethod(watchPaymentMethod);
  }, [watchPaymentMethod]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Order submitted:', data);
      console.log('Order items:', items);
      console.log('Order total:', total);
      
      toast.success('Your order has been placed successfully!');
      
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Order submission failed:', error);
      toast.error('There was a problem placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground mt-1">
          Complete your purchase
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-medium mb-4">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john.doe@example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="saveInformation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Save this information for next time
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Billing Information</h2>
                  <FormField
                    control={form.control}
                    name="sameAsShipping"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Same as shipping address
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                {!watchSameAsShipping && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" />
                        </FormControl>
                      </FormItem>
                      
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" />
                        </FormControl>
                      </FormItem>
                    </div>
                    
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" />
                      </FormControl>
                    </FormItem>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" />
                        </FormControl>
                      </FormItem>
                      
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" />
                        </FormControl>
                      </FormItem>
                      
                      <FormItem className="md:col-span-1">
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" />
                        </FormControl>
                      </FormItem>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-medium mb-4">Payment Method</h2>
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="credit-card"
                            value="credit_card"
                            checked={field.value === 'credit_card'}
                            onChange={() => field.onChange('credit_card')}
                            className="h-4 w-4 text-primary focus:ring-primary rounded-full"
                          />
                          <label htmlFor="credit-card" className="flex items-center">
                            <CreditCard className="h-5 w-5 mr-2" />
                            Credit Card
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="paypal"
                            value="paypal"
                            checked={field.value === 'paypal'}
                            onChange={() => field.onChange('paypal')}
                            className="h-4 w-4 text-primary focus:ring-primary rounded-full"
                          />
                          <label htmlFor="paypal" className="flex items-center">
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.217a.641.641 0 0 1 .632-.544h6.964c2.297 0 3.947.861 4.691 2.485.32.697.406 1.433.281 2.23-.013.082-.026.165-.042.251.4-.158.838-.267 1.311-.32.105-.011.21-.02.316-.023.44-.012.886.022 1.33.103.98.178 1.847.574 2.506 1.224.654.644 1.067 1.501 1.208 2.604.134 1.048.006 2.242-.7 3.247-.61.866-1.558 1.56-2.744 2.013-1.14.435-2.466.636-3.886.636h-.53c-.443 0-.865.19-1.159.523-.295.333-.424.776-.357 1.213l.066.374.264 1.663.008.049c.055.346-.081.705-.363.95-.284.243-.665.377-1.057.377H7.076Zm6.303-12.46c-.022.142-.044.286-.07.441-.53 3.308-2.347 4.443-4.65 4.443H6.611a.641.641 0 0 0-.633.74l1.107 7.011h3.991c.267 0 .5-.19.549-.453l.023-.117.43-2.73.28-.153a.551.551 0 0 1 .542-.456h.341c2.2 0 3.921-.893 4.425-3.475.21-1.084.1-1.99-.455-2.626-.286-.328-.645-.563-1.07-.722.07-.421.06-.841-.033-1.267-.315-1.458-1.892-1.958-3.673-1.958H6.42L3.318 20.597h3.98a.641.641 0 0 0 .633-.544L9.66 8.876h3.72c.922 0 1.75.19 2 1.224.028.112.047.232.06.359L13.38 8.876Z" />
                            </svg>
                            PayPal
                          </label>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-6 mt-6">
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input placeholder="1234 5678 9012 3456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name on Card</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="cardExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiration Date (MM/YY)</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/YY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardCvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center mt-6 bg-muted/30 p-4 rounded-lg">
                  <Lock className="h-5 w-5 text-muted-foreground mr-2" />
                  <p className="text-sm text-muted-foreground">
                    All transactions are secure and encrypted. Your payment information is never stored.
                  </p>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Place Order
                    <Check className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-20">
            <h2 className="text-xl font-medium mb-4">Order Summary</h2>
            
            <div className="max-h-80 overflow-y-auto mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex py-3 first:pt-0 border-b border-border last:border-0">
                  <div className="h-16 w-16 bg-accent/30 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <div className="ml-2 text-right">
                    <p className="font-medium">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span>{formatCurrency(estimatedTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between font-medium text-lg">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
