'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Package, User, MapPin, Phone, Mail, Calendar, DollarSign, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';

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
  sizes: string[];
  colors: string[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

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

const STATUS_ICONS = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: AlertCircle,
  RETURNED: AlertCircle,
  PAYMENT_PENDING: Clock,
  PAYMENT_FAILED: AlertCircle,
  REFUNDED: CheckCircle,
};

const STATUS_DESCRIPTIONS = {
  PENDING: 'Your order has been received and is being processed',
  CONFIRMED: 'Your order has been confirmed and is being prepared',
  PROCESSING: 'Your order is being processed and prepared for shipment',
  SHIPPED: 'Your order has been shipped and is on its way',
  DELIVERED: 'Your order has been delivered successfully',
  CANCELLED: 'Your order has been cancelled',
  RETURNED: 'Your order has been returned',
  PAYMENT_PENDING: 'Payment for your order is pending',
  PAYMENT_FAILED: 'Payment for your order has failed',
  REFUNDED: 'Your order has been refunded',
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setOrder(null);

      const response = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Failed to track order');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      setError('Failed to track order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Package;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusDescription = (status: string) => {
    return STATUS_DESCRIPTIONS[status as keyof typeof STATUS_DESCRIPTIONS] || 'Order status unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order number to view order details and status</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-amber-600" />
              Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackOrder} className="flex gap-3">
              <Input
                placeholder="Enter your order number (e.g., FL12345678)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="flex-1"
                required
              />
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track Order
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <span>Order Status</span>
                  <Badge className={`ml-auto ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{getStatusDescription(order.status)}</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Order Number:</span> {order.orderNumber}
                  </div>
                  <div>
                    <span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {new Date(order.updatedAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Total Amount:</span> Rs. {order.totalAmount.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{order.customerPhone}</span>
                    </div>
                    {order.customer?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{order.customer.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div>{order.deliveryAddress}</div>
                        <div className="text-sm text-gray-500">{order.deliveryCity}</div>
                      </div>
                    </div>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Order Notes</h4>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-600" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{item.product.name}</h4>
                          <div className="text-sm text-gray-600 mb-2">
                            Size: {item.size} • Color: {item.color} • Quantity: {item.quantity}
                          </div>
                          <div className="flex items-center justify-between">
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
                            <div className="font-semibold text-gray-900">
                              Rs. {(item.discountedPrice * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                    <span className="text-xl font-bold text-amber-600">
                      Rs. {order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Order Placed</div>
                      <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  {order.status !== 'PENDING' && (
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Status: {order.status.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-500">{new Date(order.updatedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        {!order && !error && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Your order number can be found in your order confirmation email</p>
                <p>• Order numbers start with "FL" followed by 8 digits</p>
                <p>• If you can't find your order number, please contact customer support</p>
                <p>• Orders are typically processed within 1-2 business days</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
