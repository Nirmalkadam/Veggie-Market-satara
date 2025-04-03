import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable, useSortBy, useGlobalFilter, Column } from 'react-table';
import { useAsyncDebounce } from 'react-table';
import { useAuth } from '@/context/AuthContext';
import { useAdminData } from '@/hooks/useSupabaseData';
import { formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import OrderActions from '@/components/OrderActions';
import {
  Package as PackageIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  CreditCard as CreditCardIcon,
  Truck as TruckIcon,
  User,
  ShoppingCart,
  DollarSign,
  TrendingUp
} from 'lucide-react';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    products,
    productsLoading,
    productsError,
    orders,
    ordersLoading,
    ordersError,
    users,
    usersLoading,
    usersError,
    revenue,
    fetchOrders
  } = useAdminData();

  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const UserTable = () => {
    const columns = React.useMemo(
      () => [
        {
          Header: 'Name',
          accessor: 'name',
        },
        {
          Header: 'Email',
          accessor: 'email',
        },
        {
          Header: 'Order Count',
          accessor: 'orderCount',
        },
      ],
      []
    );

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable({
      columns,
      data: users || [],
    });

    return (
      <div className="overflow-x-auto">
        <Table {...getTableProps()}>
          <TableHeader>
            {headerGroups.map(headerGroup => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <TableHead {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row)
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <TableCell {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  const OrderTable = () => {
    const columns = React.useMemo(
      () => [
        {
          Header: 'Order ID',
          accessor: 'id',
          Cell: ({ value }) => `#${value.substring(0, 8)}`,
        },
        {
          Header: 'User',
          accessor: (row) => row.user?.name || 'Guest',
        },
        {
          Header: 'Date',
          accessor: 'created_at',
          Cell: ({ value }) => formatDate(value),
        },
        {
          Header: 'Total',
          accessor: 'total',
          Cell: ({ value }) => formatCurrency(Number(value)),
        },
        {
          Header: 'Status',
          accessor: 'status',
          Cell: ({ value }) => (
            <Badge className={getStatusColor(value)}>
              {value.toUpperCase()}
            </Badge>
          ),
        },
        {
          Header: 'Actions',
          Cell: ({ row }) => (
            <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(row.original)}>
              View
            </Button>
          ),
        },
      ],
      [getStatusColor, formatDate, viewOrderDetails]
    );

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
      state,
      setGlobalFilter,
    } = useTable(
      {
        columns,
        data: orders || [],
      },
      useGlobalFilter,
      useSortBy
    );

    return (
      <>
        <GlobalFilter
          preGlobalFilteredRows={orders}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        <div className="overflow-x-auto">
          <Table {...getTableProps()}>
            <TableHeader>
              {headerGroups.map(headerGroup => (
                <TableRow {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <TableHead {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row)
                return (
                  <TableRow {...row.getRowProps()}>
                    {row.cells.map(cell => {
                      return (
                        <TableCell {...cell.getCellProps()}>
                          {cell.render('Cell')}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </>
    );
  };

  function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
  }) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
      setGlobalFilter(value || undefined)
    }, 200)

    return (
      <div className="mb-4">
        <Input
          value={value || ""}
          onChange={e => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={`Search ${count} orders...`}
          className="max-w-md"
        />
      </div>
    )
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your store
        </p>
      </div>

      <Tabs defaultValue="dashboard" onValueChange={handleTabChange}>
        <TabsList className="mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
                <CardDescription>
                  All time revenue generated
                </CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {revenue ? formatCurrency(revenue.total) : 'Loading...'}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Today's Revenue
                </CardTitle>
                <CardDescription>
                  Revenue generated today
                </CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {revenue ? formatCurrency(revenue.today) : 'Loading...'}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  Monthly Revenue
                </CardTitle>
                <CardDescription>
                  Revenue generated this month
                </CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {revenue ? formatCurrency(revenue.monthly) : 'Loading...'}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Manage orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : ordersError ? (
                <p className="text-red-500">Error: {ordersError}</p>
              ) : (
                <OrderTable />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : usersError ? (
                <p className="text-red-500">Error: {usersError}</p>
              ) : (
                <UserTable />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedOrder && (
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Order Details #{selectedOrder.id.substring(0, 8)}
              </DialogTitle>
              <DialogDescription>
                View and manage order information.
              </DialogDescription>
            </DialogHeader>
            
            {/* Order details content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium">Customer Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p>{selectedOrder.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p>{selectedOrder.user?.email || 'N/A'}</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <h3 className="text-lg font-medium">Shipping Address</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p>{selectedOrder.street}, {selectedOrder.city}</p>
                    <p>{selectedOrder.state}, {selectedOrder.zip_code} {selectedOrder.country}</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <h3 className="text-lg font-medium">Payment Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">Payment Method:</span>
                    <p>{selectedOrder.payment_method}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden">
                        {item.products?.image ? (
                          <img
                            src={item.products.image}
                            alt={item.products.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-muted">
                            <PackageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.products?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatCurrency(Number(item.price))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(Number(selectedOrder.total))}</span>
                </div>
              </div>
              
              {/* Update this part to show the admin version of order actions */}
              <div className="md:col-span-2 mt-4">
                <h3 className="font-medium mb-2">Update Status</h3>
                <OrderActions
                  orderId={selectedOrder.id}
                  orderStatus={selectedOrder.status}
                  onStatusChange={() => {
                    // Refetch orders after status update
                    fetchOrders();
                    // Optionally close the dialog
                    // setIsOrderDialogOpen(false);
                  }}
                  isAdminView={true}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Admin;
