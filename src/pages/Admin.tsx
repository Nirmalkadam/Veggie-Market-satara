
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
  Phone,
  Calendar,
  ArrowUp,
  ArrowDown,
  Star,
  Image,
  Loader
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAdminData } from '@/hooks/useSupabaseData';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Category options
const categoryOptions = ['vegetables', 'fruits', 'herbs', 'roots', 'greens'];

// Unit options
const unitOptions = ['kg', 'bunch', 'piece', 'pack', 'lb'];

// Order status options
const orderStatusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Use the hook to get admin data with realtime updates
  const {
    // Products
    products,
    productsLoading,
    productsError,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Orders
    orders,
    ordersLoading,
    ordersError,
    updateOrderStatus,
    
    // Users
    users,
    usersLoading,
    usersError,
    
    // Revenue
    revenue
  } = useAdminData();
  
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOrderEditDialogOpen, setIsOrderEditDialogOpen] = useState(false);
  const [isImagePreviewDialogOpen, setIsImagePreviewDialogOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [uploadingImage, setUploadingImage] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'vegetables',
    stock: 0,
    unit: 'kg',
    organic: false,
  });

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || (user && !user.isAdmin)) {
      navigate('/');
      toast.error("You don't have permission to access the admin panel.");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Filter products based on search query
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Filter orders based on search query
  const filteredOrders = orders?.filter(order => 
    order?.user?.name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(orderSearchQuery.toLowerCase())
  ) || [];

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

  // Filter users based on search query
  const filteredUsers = users?.filter(user => 
    user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (user.email && typeof user.email === 'string' && user.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
  ) || [];

  // Get current users for pagination
  const userIndexOfLastItem = userCurrentPage * itemsPerPage;
  const userIndexOfFirstItem = userIndexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(userIndexOfFirstItem, userIndexOfLastItem);
  const userTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleOrderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderCurrentPage(1); // Reset to first page on new search
  };

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUserCurrentPage(1); // Reset to first page on new search
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (isEditDialogOpen && editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
      });
    } else {
      setNewProduct({
        ...newProduct,
        [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (isEditDialogOpen && editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [name]: value
      });
    } else {
      setNewProduct({
        ...newProduct,
        [name]: value
      });
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (isEditDialogOpen && editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [name]: checked
      });
    } else {
      setNewProduct({
        ...newProduct,
        [name]: checked
      });
    }
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

  const handleCreateProduct = async () => {
    // Validate form
    if (!newProduct.name || !newProduct.description || newProduct.price <= 0) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      await addProduct(newProduct);
      setIsCreateDialogOpen(false);
      toast.success(`${newProduct.name} has been added to the catalog.`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('There was a problem adding the product.');
    }
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    // Validate form
    if (!editingProduct.name || !editingProduct.description || editingProduct.price <= 0) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      await updateProduct(editingProduct.id, editingProduct);
      setIsEditDialogOpen(false);
      toast.success(`${editingProduct.name} has been updated.`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('There was a problem updating the product.');
    }
  };

  const openDeleteDialog = (product: any) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id);
      setIsDeleteDialogOpen(false);
      toast.success(`${productToDelete.name} has been removed from the catalog.`);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('There was a problem deleting the product.');
    }
  };

  const openOrderEditDialog = (order: any) => {
    setEditingOrder(order);
    setIsOrderEditDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    try {
      await updateOrderStatus(editingOrder.id, editingOrder.status);
      setIsOrderEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('There was a problem updating the order.');
    }
  };

  const previewImage = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
    setIsImagePreviewDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  // If the user is not authenticated or not an admin, don't render anything
  if (!isAuthenticated || (user && !user.isAdmin)) {
    return null;
  }

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
            <p className="text-2xl font-semibold">{products?.length || 0}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Orders</p>
            <p className="text-2xl font-semibold">{orders?.length || 0}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 flex items-center">
          <div className="bg-amber-100 text-amber-600 p-3 rounded-full mr-4">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Customers</p>
            <p className="text-2xl font-semibold">{users?.length || 0}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 flex items-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
            <BarChart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Revenue</p>
            <p className="text-2xl font-semibold">{formatCurrency(revenue.total)}</p>
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

            {productsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : currentProducts.length > 0 ? (
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
                            <div 
                              className="h-10 w-10 rounded-md overflow-hidden bg-accent/30 cursor-pointer"
                              onClick={() => product.image && previewImage(product.image)}
                            >
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted">
                                  <Image className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
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
            
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : currentOrders.length > 0 ? (
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
                        <TableCell>#{order.id.substring(0, 8)}</TableCell>
                        <TableCell>{order.user?.name || 'Unknown'}</TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>{order.items?.length || 0}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(order.total))}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            {order.payment_method || 'COD'}
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
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted/30 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {orderSearchQuery ? 'Try adjusting your search terms' : 'Orders will appear here when customers place them'}
                </p>
              </div>
            )}
            
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
            
            {usersLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : currentUsers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || 'No Name'}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            {user.email || user.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {user.is_admin ? 'Admin' : 'Customer'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{user.orderCount || 0}</span>
                        </TableCell>
                        <TableCell>
                          {user.city && user.country ? (
                            <span className="text-sm">{user.city}, {user.country}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not specified</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted/30 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No users found</h3>
                <p className="text-muted-foreground mb-6">
                  {userSearchQuery ? 'Try adjusting your search terms' : 'Users will appear here when they register'}
                </p>
              </div>
            )}
            
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
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Daily Revenue
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {formatCurrency(revenue.today)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <span className={revenue.today > 0 ? "text-green-500 flex items-center" : "text-red-500 flex items-center"}>
                      {revenue.today > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {revenue.today > 0 ? "+" : ""}
                      {revenue.today.toFixed(2)}
                    </span>
                    <span> from yesterday</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Revenue
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {formatCurrency(revenue.monthly)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-green-500 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />+{(revenue.monthly * 0.1).toFixed(2)}
                    </span>
                    <span> from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {formatCurrency(revenue.total)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-green-500 flex items-center">
                      <Star className="h-3 w-3 mr-1" />Lifetime earnings
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {orders?.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{order.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>
                      <div>
                        <p className="font-medium">{formatCurrency(parseFloat(order.total))}</p>
                        <Badge className={`
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'processing' || order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'}`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Top Products</h3>
                <div className="space-y-4">
                  {products?.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center border-b pb-2">
                      <div className="flex items-center">
                        <span className="font-bold text-primary mr-3">#{index + 1}</span>
                        <div className="h-8 w-8 rounded overflow-hidden bg-accent/30 mr-3">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted">
                              <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{formatCurrency(product.price)}</p>
                        <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory. Fill out all the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                placeholder="Organic Broccoli"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                placeholder="Fresh organic broccoli, locally grown..."
                className="col-span-3 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (₹) *
              </Label>
              <Input
                id="price"
                name="price"
                value={newProduct.price}
                onChange={handleInputChange}
                placeholder="129.99"
                type="number"
                min="0"
                step="0.01"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <Input
                id="image"
                name="image"
                value={newProduct.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={newProduct.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock *
              </Label>
              <Input
                id="stock"
                name="stock"
                value={newProduct.stock}
                onChange={handleInputChange}
                placeholder="50"
                type="number"
                min="0"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unit
              </Label>
              <Select
                value={newProduct.unit}
                onValueChange={(value) => handleSelectChange('unit', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div></div>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="organic"
                  checked={newProduct.organic}
                  onCheckedChange={(checked) => handleCheckboxChange('organic', !!checked)}
                />
                <label
                  htmlFor="organic"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Organic Product
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProduct}>
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editingProduct.name}
                  onChange={handleInputChange}
                  placeholder="Organic Broccoli"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right pt-2">
                  Description *
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editingProduct.description}
                  onChange={handleInputChange}
                  placeholder="Fresh organic broccoli, locally grown..."
                  className="col-span-3 min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Price (₹) *
                </Label>
                <Input
                  id="edit-price"
                  name="price"
                  value={editingProduct.price}
                  onChange={handleInputChange}
                  placeholder="129.99"
                  type="number"
                  min="0"
                  step="0.01"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-image" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="edit-image"
                  name="image"
                  value={editingProduct.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Select
                  value={editingProduct.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                  Stock *
                </Label>
                <Input
                  id="edit-stock"
                  name="stock"
                  value={editingProduct.stock}
                  onChange={handleInputChange}
                  placeholder="50"
                  type="number"
                  min="0"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-unit" className="text-right">
                  Unit
                </Label>
                <Select
                  value={editingProduct.unit}
                  onValueChange={(value) => handleSelectChange('unit', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div></div>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="edit-organic"
                    checked={editingProduct.organic}
                    onCheckedChange={(checked) => handleCheckboxChange('organic', !!checked)}
                  />
                  <label
                    htmlFor="edit-organic"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Organic Product
                  </label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {productToDelete && (
              <div className="flex items-center gap-3 p-3 border rounded">
                <div className="h-12 w-12 rounded overflow-hidden bg-accent/30">
                  {productToDelete.image ? (
                    <img 
                      src={productToDelete.image} 
                      alt={productToDelete.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <Image className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{productToDelete.name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(productToDelete.price)} • {productToDelete.stock} in stock</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Edit Dialog */}
      <Dialog open={isOrderEditDialogOpen} onOpenChange={setIsOrderEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the order status and notify the customer.
            </DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <div className="grid gap-4 py-4">
              <div className="border p-4 rounded-md mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold">Order #{editingOrder.id.substring(0, 8)}</h3>
                  <div className="text-sm text-muted-foreground">{formatDate(editingOrder.created_at)}</div>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-muted-foreground">Customer: </span>
                  <span className="font-medium">{editingOrder.user?.name || 'Unknown'}</span>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-muted-foreground">Total: </span>
                  <span className="font-medium">{formatCurrency(parseFloat(editingOrder.total))}</span>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-muted-foreground">Items: </span>
                  <span className="font-medium">{editingOrder.items?.length || 0}</span>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-muted-foreground">Shipping Address: </span>
                  <span className="font-medium">
                    {editingOrder.street}, {editingOrder.city}, {editingOrder.state} {editingOrder.zip_code}, {editingOrder.country}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Order Status
                </Label>
                <Select
                  value={editingOrder.status}
                  onValueChange={(value) => setEditingOrder({...editingOrder, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder}>
              Update Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={isImagePreviewDialogOpen} onOpenChange={setIsImagePreviewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] sm:max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex justify-center">
            <img
              src={previewImageUrl}
              alt="Product Preview"
              className="max-h-[500px] object-contain"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImagePreviewDialogOpen(false)}>
              Close
            </Button>
            <Button asChild>
              <a href={previewImageUrl} target="_blank" rel="noopener noreferrer">
                Open Original
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
