import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Package, 
  Users, 
  ShoppingBag,
  BarChart,
  Settings,
  FileText,
  AlertCircle,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  XCircle,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Product, Category, Order, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock products data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Organic Broccoli",
    description: "Fresh organic broccoli, locally grown and packed with vitamins and minerals.",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 50,
    unit: "bunch",
    organic: true,
  },
  {
    id: "2",
    name: "Fresh Carrots",
    description: "Sweet and crunchy organic carrots, perfect for salads, juicing, or cooking.",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1582515073490-39981397c445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 80,
    unit: "kg",
    organic: true,
  },
  {
    id: "3",
    name: "Bell Peppers Mix",
    description: "Colorful mix of fresh bell peppers - red, yellow, and green. Great for stir-fries or salads.",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "vegetables",
    stock: 35,
    unit: "pack",
  }
];

// Mock orders data
const mockOrders: Order[] = [
  {
    id: '1',
    user: {
      id: '2',
      email: 'user@example.com',
      name: 'John Doe',
      isAdmin: false,
    },
    items: [
      {
        product: mockProducts[0],
        quantity: 2
      },
      {
        product: mockProducts[1],
        quantity: 3
      }
    ],
    total: 449.94,
    status: 'pending',
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
    address: {
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    paymentMethod: 'COD',
  },
  {
    id: '2',
    user: {
      id: '2',
      email: 'user@example.com',
      name: 'Jane Smith',
      isAdmin: false,
    },
    items: [
      {
        product: mockProducts[2],
        quantity: 1
      }
    ],
    total: 149.99,
    status: 'processing',
    createdAt: new Date('2023-05-14'),
    updatedAt: new Date('2023-05-14'),
    address: {
      street: '456 Oak St',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    paymentMethod: 'COD',
  },
  {
    id: '3',
    user: {
      id: '2',
      email: 'user@example.com',
      name: 'Robert Johnson',
      isAdmin: false,
    },
    items: [
      {
        product: mockProducts[0],
        quantity: 1
      },
      {
        product: mockProducts[1],
        quantity: 2
      }
    ],
    total: 269.97,
    status: 'delivered',
    createdAt: new Date('2023-05-13'),
    updatedAt: new Date('2023-05-15'),
    address: {
      street: '789 Pine St',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    paymentMethod: 'COD',
  },
];

// Category options
const categoryOptions: Category[] = ['vegetables', 'fruits', 'herbs', 'roots', 'greens'];

// Unit options
const unitOptions = ['kg', 'bunch', 'piece', 'pack', 'lb'];

// Order status options
const orderStatusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// Website settings mock data
const websiteSettings = {
  siteName: 'Veggie Market',
  logo: '/logo.png',
  currency: 'INR',
  currencySymbol: '₹',
  contactEmail: 'info@veggiemarket.com',
  contactPhone: '+91 9876543210',
  address: 'Mumbai, India',
  socialLinks: {
    facebook: 'https://facebook.com/veggiemarket',
    instagram: 'https://instagram.com/veggiemarket',
    twitter: 'https://twitter.com/veggiemarket',
  },
  features: {
    enableCOD: true,
    enableOnlinePayment: false,
    enableReviews: true,
  }
};

const Admin = () => {
  const { user, isAuthenticated, getAllUsers } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOrderEditDialogOpen, setIsOrderEditDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [settings, setSettings] = useState(websiteSettings);

  // New product form state
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'vegetables',
    stock: 0,
    unit: 'kg',
    organic: false,
  });

  // Monthly revenue data for reports
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 16000 },
    { month: 'May', revenue: 21000 },
    { month: 'Jun', revenue: 19000 },
  ];

  // Product category distribution for reports
  const categoryDistributionData = [
    { name: 'Vegetables', value: 60 },
    { name: 'Fruits', value: 25 },
    { name: 'Herbs', value: 10 },
    { name: 'Others', value: 5 },
  ];

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || (user && !user.isAdmin)) {
      navigate('/');
      return;
    }
    
    // Load initial products data
    setProducts(mockProducts);
    
    // Load initial orders data from mock
    setOrders(mockOrders);
    
    // Set up real-time listeners for users and orders
    setupRealtimeListeners();
    
    // Get initial users list
    fetchUsers();
    
    // Cleanup function to remove listeners when component unmounts
    return () => {
      const channel = supabase.channel('public:profiles');
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user, navigate]);
  
  const fetchUsers = async () => {
    try {
      const usersList = await getAllUsers();
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };
  
  const setupRealtimeListeners = () => {
    // Set up real-time listener for new user profiles
    const channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'profiles'
        },
        async (payload) => {
          console.log('Profile change received:', payload);
          // Refresh the users list when there's a change
          await fetchUsers();
          toast.info('User list updated');
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to profiles changes');
        } else {
          console.error('Failed to subscribe to profiles changes:', status);
        }
      });
      
    // In the future, you can add more channels for orders when that table is created
    // Example:
    // const ordersChannel = supabase
    //   .channel('public:orders')
    //   .on('postgres_changes', {...})
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => 
    order.user.name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(orderSearchQuery.toLowerCase())
  );

  // Get current products for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Get current orders for pagination
  const orderIndexOfLastItem = orderCurrentPage * itemsPerPage;
  const orderIndexOfFirstItem = orderIndexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(orderIndexOfFirstItem, orderIndexOfLastItem);
  const orderTotalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already applied via the filter
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleOrderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already applied via the filter
    setOrderCurrentPage(1); // Reset to first page on new search
  };

  const openCreateDialog = () => {
    // Reset new product form
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      image: '',
      category: 'vegetables',
      stock: 0,
      unit: 'kg',
      organic: false,
    });
    setIsCreateDialogOpen(true);
  };

  const handleCreateProduct = () => {
    // Validate form
    if (!newProduct.name || !newProduct.description || newProduct.price <= 0 || !newProduct.image) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create new product
    const createdProduct: Product = {
      ...newProduct,
      id: (products.length + 1).toString(), // In a real app, this would be generated by the server
    };

    // Add to products array
    setProducts([...products, createdProduct]);
    
    // Close dialog and show success message
    setIsCreateDialogOpen(false);
    toast({
      title: "Product Created",
      description: `${createdProduct.name} has been added to the catalog.`,
    });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    // Validate form
    if (!editingProduct.name || !editingProduct.description || editingProduct.price <= 0 || !editingProduct.image) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Update products array
    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    
    // Close dialog and show success message
    setIsEditDialogOpen(false);
    toast({
      title: "Product Updated",
      description: `${editingProduct.name} has been updated.`,
    });
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    
    // Remove from products array
    setProducts(products.filter(p => p.id !== productToDelete.id));
    
    // Close dialog and show success message
    setIsDeleteDialogOpen(false);
    toast({
      title: "Product Deleted",
      description: `${productToDelete.name} has been removed from the catalog.`,
    });
  };

  const openOrderEditDialog = (order: Order) => {
    setEditingOrder(order);
    setIsOrderEditDialogOpen(true);
  };

  const handleUpdateOrder = () => {
    if (!editingOrder) return;

    // Update orders array
    setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
    
    // Close dialog and show success message
    setIsOrderEditDialogOpen(false);
    toast({
      title: "Order Updated",
      description: `Order #${editingOrder.id} status updated to ${editingOrder.status}.`,
    });
  };

  const openSettingsDialog = () => {
    setIsSettingsDialogOpen(true);
  };

  const handleUpdateSettings = () => {
    // Update settings
    setSettings({ ...settings });
    
    // Close dialog and show success message
    setIsSettingsDialogOpen(false);
    toast({
      title: "Settings Updated",
      description: "Website settings have been updated successfully.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Get current users for pagination
  const userIndexOfLastItem = userCurrentPage * itemsPerPage;
  const userIndexOfFirstItem = userIndexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(userIndexOfFirstItem, userIndexOfLastItem);
  const userTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already applied via the filter
    setUserCurrentPage(1); // Reset to first page on new search
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage products, orders, users, and website settings
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6 flex items-center">
          <div className="bg-primary/10 text-primary p-3 rounded-full mr-4">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Products</p>
            <p className="text-2xl font-semibold">{products.length}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Orders</p>
            <p className="text-2xl font-semibold">{orders.length}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 flex items-center">
          <div className="bg-amber-100 text-amber-600 p-3 rounded-full mr-4">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Customers</p>
            <p className="text-2xl font-semibold">{users.length}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 flex items-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
            <BarChart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Revenue</p>
            <p className="text-2xl font-semibold">{formatCurrency(101249)}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Products Tab */}
        <TabsContent value="products">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-xl font-medium">Product Catalog</h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-r-none"
                    />
                  </div>
                  <Button type="submit" className="rounded-l-none">
                    Search
                  </Button>
                </form>
                
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            {currentProducts.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-accent/30">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{product.category}</span>
                          {product.organic && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              Organic
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <span className={product.stock <= 10 ? 'text-red-500 font-medium' : ''}>
                            {product.stock} {product.unit}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => openDeleteDialog(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted/30 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button 
                      key={page}
                      variant={currentPage === page ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-xl font-medium">Order Management</h2>
              
              <form onSubmit={handleOrderSearch} className="flex w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="pl-9 rounded-r-none"
                  />
                </div>
                <Button type="submit" className="rounded-l-none">
                  Search
                </Button>
              </form>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.user.name}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.items.reduce((total, item) => total + item.quantity, 0)}</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {order.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium 
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'processing' || order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openOrderEditDialog(order)}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Order Pagination */}
            {filteredOrders.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {orderIndexOfFirstItem + 1} to {Math.min(orderIndexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={orderCurrentPage === 1}
                    onClick={() => setOrderCurrentPage(orderCurrentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: orderTotalPages }, (_, i) => i + 1).map((page) => (
                    <Button 
                      key={page}
                      variant={orderCurrentPage === page ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setOrderCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={orderCurrentPage === orderTotalPages}
                    onClick={() => setOrderCurrentPage(orderCurrentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-xl font-medium">User Management</h2>
              
              <form onSubmit={handleUserSearch} className="flex w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    type="text"
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-9 rounded-r-none"
                  />
                </div>
                <Button type="submit" className="rounded-l-none">
                  Search
                </Button>
              </form>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => {
                    // Count orders for this user
                    const userOrderCount = orders.filter(order => order.user.id === user.id).length;
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>#{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {user.isAdmin ? 'Admin' : 'Customer'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{userOrderCount}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* User Pagination */}
            {filteredUsers.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {userIndexOfFirstItem + 1} to {Math.min(userIndexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={userCurrentPage === 1}
                    onClick={() => setUserCurrentPage(userCurrentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: userTotalPages }, (_, i) => i + 1).map((page) => (
                    <Button 
                      key={page}
                      variant={userCurrentPage === page ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setUserCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={userCurrentPage === userTotalPages}
                    onClick={() => setUserCurrentPage(userCurrentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-medium mb-6">Reports &amp; Analytics</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
                {/* Chart would go here in a real implementation */}
                <div className="h-64 bg-muted/20 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Revenue chart placeholder</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Product Categories</h3>
                {/* Chart would go here in a real implementation */}
                <div className="h-64 bg-muted/20 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Categories chart placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Store Settings</h2>
              <Button onClick={openSettingsDialog}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Store Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Store Name</p>
                    <p className="font-medium">{settings.siteName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {

