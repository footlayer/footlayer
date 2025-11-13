
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, MapPin, Phone, Calendar, ArrowRight, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  discountAmount: number;
  discountedPrice: number;
  product: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  notes?: string;
  orderItems: OrderItem[];
}

interface OrderConfirmationProps {
  orderNumber: string;
}

export function OrderConfirmation({ orderNumber }: OrderConfirmationProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      const data = await response.json();
      setOrderDetails(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy order number:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find an order with this number.</p>
          <Link href="/products">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your order. We'll start preparing it right away.
          </p>
          
          {/* Order Number with Copy Functionality */}
          <div className="bg-white rounded-lg border-2 border-amber-200 p-6 mb-6 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Your Order Number</p>
              <div className="flex items-center justify-center space-x-3">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-lg px-4 py-2 font-mono">
                  #{orderDetails.orderNumber}
                </Badge>
                <Button
                  onClick={copyOrderNumber}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                📋 Save this number for order tracking
              </p>
            </div>
          </div>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border p-8 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Phone className="h-4 w-4 mr-2 text-amber-600" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Name:</span> {orderDetails.customerName}</p>
                <p><span className="font-medium">Phone:</span> {orderDetails.customerPhone}</p>
              </div>
            </div>

            {/* Delivery Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-amber-600" />
                Delivery Address
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{orderDetails.deliveryAddress}</p>
                <p>{orderDetails.deliveryCity}</p>
              </div>
            </div>

            {/* Order Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                Order Information
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Order Date:</span> {new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                <p><span className="font-medium">Status:</span> {orderDetails.status}</p>
                <p><span className="font-medium">Payment:</span> Cash on Delivery</p>
              </div>
            </div>

            {/* Total */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Package className="h-4 w-4 mr-2 text-amber-600" />
                Order Total
              </h3>
              <div className="text-2xl font-bold text-amber-600">
                Rs. {orderDetails.totalAmount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Cash on Delivery</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            {orderDetails.orderItems && orderDetails.orderItems.length > 0 ? (
              <div className="space-y-4">
                {orderDetails.orderItems.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    {item.discountAmount > 0 ? (
                      <div>
                        <div className="text-sm text-gray-500 line-through">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="font-medium text-red-600">
                          Rs. {(item.discountedPrice * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-xs text-red-600">
                          Saved: Rs. {(item.discountAmount * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="font-medium text-amber-600">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No order items found</p>
                <p className="text-sm">Please contact support if this seems incorrect</p>
              </div>
            )}
          </div>

          {orderDetails.notes && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Special Instructions</h3>
              <p className="text-sm text-gray-600">{orderDetails.notes}</p>
            </div>
          )}
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border p-8 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">What happens next?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-amber-600">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Order Processing</h3>
                <p className="text-sm text-gray-600">We'll start preparing your order within 2-4 hours.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-amber-600">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Quality Check</h3>
                <p className="text-sm text-gray-600">Each item is carefully inspected before packaging.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Truck className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Delivery</h3>
                <p className="text-sm text-gray-600">Your order will be delivered within 1-3 business days.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Link href={`/track-order?orderNumber=${orderNumber}`}>
              <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                Track Your Order
                <Truck className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              Questions about your order?{' '}
              <a 
                href="https://wa.me/923110047164" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 underline font-medium"
              >
                Contact us on WhatsApp: 03110047164
              </a>
            </p>
            <p>Use order number <span className="font-mono font-semibold">#{orderNumber}</span> for tracking</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
