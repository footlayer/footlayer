
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, User, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CartItem, CheckoutFormData } from '../../lib/types';
import { useToast } from '../../hooks/use-toast';
import { calculateDiscount } from '../../lib/discount-utils';

export function CheckoutForm() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    deliveryCity: '',
    notes: ''
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    try {
      const items = localStorage.getItem('footLayerCart');
      if (items) {
        const parsedItems = JSON.parse(items);
        if (parsedItems.length === 0) {
          router.push('/cart');
          return;
        }
        setCartItems(parsedItems);
      } else {
        router.push('/cart');
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      router.push('/cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const productWithDiscounts = item.product as any;
      const discountInfo = calculateDiscount(productWithDiscounts);
      const itemPrice = discountInfo.isActive ? discountInfo.discountedPrice : item.product.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const getOriginalTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalDiscount = () => {
    return getOriginalTotalPrice() - getTotalPrice();
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || !formData.deliveryAddress || !formData.deliveryCity) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || '',
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity,
        notes: formData.notes || '',
        items: cartItems.map(item => {
          const productWithDiscounts = item.product as any;
          const discountInfo = calculateDiscount(productWithDiscounts);
          const itemPrice = discountInfo.isActive ? discountInfo.discountedPrice : item.product.price;
          return {
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.product.price,
            discountAmount: discountInfo.isActive ? discountInfo.discountAmount : 0,
            discountedPrice: itemPrice
          };
        }),
        totalAmount: getTotalPrice()
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();

      // Clear cart
      localStorage.removeItem('footLayerCart');
      window.dispatchEvent(new Event('cartUpdated'));

      // Redirect to confirmation page
      router.push(`/order-confirmation?orderNumber=${result.orderNumber}`);

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order failed",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-12">
      {/* Checkout Form */}
      <div className="lg:col-span-2">
        <Link 
          href="/cart" 
          className="inline-flex items-center text-gray-600 hover:text-amber-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Link>

        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 mr-2 text-amber-600" />
              Customer Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pl-10"
                />
                <User className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
              </div>
              
              <div className="relative">
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pl-10"
                />
                <Phone className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
              </div>
              
              <div className="sm:col-span-2 relative">
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pl-10"
                />
                <Mail className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </motion.div>

          {/* Delivery Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-amber-600" />
              Delivery Information
            </h2>
            
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Complete Address *
                </label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pl-10"
                  placeholder="Enter your complete delivery address..."
                />
                <MapPin className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
              </div>
              
              <div>
                <label htmlFor="deliveryCity" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="deliveryCity"
                  name="deliveryCity"
                  value={formData.deliveryCity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Lahore"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Any special delivery instructions..."
                />
              </div>
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-amber-600" />
              Payment Method
            </h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Cash on Delivery</h3>
                  <p className="text-sm text-amber-700">Pay when your order is delivered to your doorstep</p>
                </div>
              </div>
            </div>
          </motion.div>
        </form>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1 mt-8 lg:mt-0">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-sm border p-6 sticky top-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
          
          {/* Order Items */}
          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <div className="relative w-12 h-12 bg-gray-50 rounded-md overflow-hidden">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {item.size} • {item.color} • Qty: {item.quantity}
                  </p>
                  <p className="text-sm font-medium text-amber-600">
                    Rs. {(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3 mb-6 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Items ({getTotalItems()})</span>
              <span className="font-medium">Rs. {getOriginalTotalPrice().toLocaleString()}</span>
            </div>
            
            {getTotalDiscount() > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">-Rs. {getTotalDiscount().toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Delivery</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-amber-600">
                  Rs. {getTotalPrice().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </Button>

          <div className="mt-4 text-center text-xs text-gray-500">
            <p>💰 Cash on Delivery • 🔒 Secure Checkout</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
