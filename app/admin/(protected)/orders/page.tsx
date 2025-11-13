'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Eye, Edit, Package, User, MapPin, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  totalAmount: number;
  status: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  customer?: Customer;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  discountAmount: number;
  discountedPrice: number;
  product: Product;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface PageProps {
  searchParams?: { q?: string; page?: string; status?: string };
}

const ORDER_STATUSES = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'PAYMENT_PENDING', label: 'Payment Pending' },
  { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-amber-200 text-amber-900',
  PROCESSING: 'bg-amber-300 text-amber-900',
  SHIPPED: 'bg-amber-400 text-white',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RETURNED: 'bg-orange-100 text-orange-800',
  PAYMENT_PENDING: 'bg-amber-100 text-amber-800',
  PAYMENT_FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function OrdersPage({ searchParams }: PageProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams?.q || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams?.q || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.page || '1', 10));
  const [selectedStatus, setSelectedStatus] = useState(searchParams?.status || 'ALL');
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const limit = 10;
  const skip = (currentPage - 1) * limit;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearchQuery, selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
      if (selectedStatus && selectedStatus !== 'ALL') params.set('status', selectedStatus);
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || []);
        setTotalOrders(data.total || 0);
        setTotalPages(Math.max(Math.ceil((data.total || 0) / limit), 1));
      } else {
        setError(data.error || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openOrderDialog = async (order: Order) => {
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedOrder(data.order);
        setIsDialogOpen(true);
        setError(null);
        setSuccess(null);
      } else {
        setError(data.error || 'Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Order status updated successfully');
        setIsDialogOpen(false);
        fetchOrders(); // Refresh the orders list
      } else {
        setError(data.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedStatus && selectedStatus !== 'ALL') params.set('status', selectedStatus);
    params.set('page', '1');
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
    if (status && status !== 'ALL') params.set('status', status);
    params.set('page', '1');
    router.push(`/admin/orders?${params.toString()}`);
  };

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
    if (selectedStatus && selectedStatus !== 'ALL') params.set('status', selectedStatus);
    params.set('page', String(nextPage));
    return `/admin/orders?${params.toString()}`;
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedStatus} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-amber-50">
              <TableRow>
                <TableHead className="font-semibold">Order #</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Items</TableHead>
                <TableHead className="font-semibold">Total</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-t">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      {order.orderNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{order.orderItems.length}</span>
                      <span className="text-gray-500 text-sm">items</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-gray-500" />
                      <span className="font-medium">Rs. {order.totalAmount.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => openOrderDialog(order)}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages} • {totalOrders} total orders
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            disabled={!hasPrev}
            onClick={() => hasPrev && router.push(buildHref(currentPage - 1))}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            disabled={!hasNext}
            onClick={() => hasNext && router.push(buildHref(currentPage + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Order ID:</span> {selectedOrder.orderNumber}</div>
                      <div><span className="font-medium">Status:</span> 
                        <Badge className={`ml-2 text-xs ${STATUS_COLORS[selectedOrder.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                          {selectedOrder.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div><span className="font-medium">Total:</span> Rs. {selectedOrder.totalAmount.toLocaleString()}</div>
                      <div><span className="font-medium">Created:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                      <div><span className="font-medium">Updated:</span> {new Date(selectedOrder.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        {selectedOrder.customerName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        {selectedOrder.customerPhone}
                      </div>
                      {selectedOrder.customer?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {selectedOrder.customer.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {selectedOrder.deliveryAddress}, {selectedOrder.deliveryCity}
                      </div>
                    </div>
                  </div>
                </div>
                {selectedOrder.notes && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-900 mb-1">Order Notes</h4>
                    <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <div className="text-sm text-gray-600">
                            Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                          </div>
                          <div className="text-sm font-medium text-amber-600">
                            {item.discountAmount > 0 ? (
                              <div>
                                <div className="line-through text-gray-500">Rs. {item.price.toLocaleString()} each</div>
                                <div className="text-red-600">Rs. {item.discountedPrice.toLocaleString()} each</div>
                                <div className="text-xs text-red-600">Saved: Rs. {item.discountAmount.toLocaleString()}</div>
                              </div>
                            ) : (
                              <div>Rs. {item.price.toLocaleString()} each</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            Rs. {(item.discountedPrice * item.quantity).toLocaleString()}
                          </div>
                          {item.discountAmount > 0 && (
                            <div className="text-xs text-red-600">
                              Saved: Rs. {(item.discountAmount * item.quantity).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Update Order Status</h3>
                <div className="flex items-center gap-3">
                  <Select onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.slice(1).map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {updating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


