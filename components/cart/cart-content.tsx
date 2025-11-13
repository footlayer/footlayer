
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CartItem } from '../../lib/types';
import { useToast } from '../../hooks/use-toast';
import { calculateDiscount } from '../../lib/discount-utils';

// Helper function to check if a cart item variant is in stock
async function checkVariantStock(productId: string, size: string, color: string): Promise<{ inStock: boolean; quantity: number }> {
  try {
    const response = await fetch(`/api/products/${productId}/stock?size=${size}&color=${color}`);
    if (response.ok) {
      const data = await response.json();
      return {
        inStock: data.inStock,
        quantity: data.quantity
      };
    }
  } catch (error) {
    console.error('Error checking variant stock:', error);
  }
  return { inStock: true, quantity: 0 }; // Fallback to allow item if check fails
}

export function CartContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [itemStockStatus, setItemStockStatus] = useState<Record<string, { inStock: boolean; quantity: number }>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadCartItems();
    refreshCartWithUpdatedProducts();
  }, []);

  const refreshCartWithUpdatedProducts = async (showToast = false) => {
    try {
      const cartItems = localStorage.getItem('footLayerCart');
      if (!cartItems) return;

      const items = JSON.parse(cartItems);
      if (!items.length) return;

      // Fetch updated product data for all cart items
      const productIds = [...new Set(items.map((item: any) => item.productId))];
      const updatedProducts: any[] = [];

      for (const productId of productIds) {
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (response.ok) {
            const data = await response.json();
            updatedProducts.push(data.product);
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }

      // Update cart items with fresh product data
      const updatedCartItems = items.map((item: any) => {
        const updatedProduct = updatedProducts.find(p => p.id === item.productId);
        return updatedProduct ? { ...item, product: updatedProduct } : item;
      });

      // Only update if there are changes
      const hasChanges = JSON.stringify(items) !== JSON.stringify(updatedCartItems);
      if (hasChanges) {
        setCartItems(updatedCartItems);
        localStorage.setItem('footLayerCart', JSON.stringify(updatedCartItems));
      }

      // Check stock status for all cart items
      await checkStockForAllItems(updatedCartItems);
      
    } catch (error) {
      console.error('Error refreshing cart with updated products:', error);
    }
  };

  const checkStockForAllItems = async (items: CartItem[]) => {
    const stockStatus: Record<string, { inStock: boolean; quantity: number }> = {};
    
    for (const item of items) {
      const stockInfo = await checkVariantStock(item.productId, item.size, item.color);
      stockStatus[item.id] = stockInfo;
    }
    
    setItemStockStatus(stockStatus);
  };

  const loadCartItems = () => {
    try {
      const items = localStorage.getItem('footLayerCart');
      if (items) {
        setCartItems(JSON.parse(items));
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItems = (newItems: CartItem[]) => {
    setCartItems(newItems);
    localStorage.setItem('footLayerCart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    updateCartItems(updatedItems);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    updateCartItems(updatedItems);
    
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    });
  };

  const clearCart = () => {
    updateCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
        <Link href="/products">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-12">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Cart Items ({getTotalItems()})
          </h2>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => refreshCartWithUpdatedProducts(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCart}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {cartItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/products/${item.product.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-amber-600 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.product.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Size: {item.size}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Color: {item.color}
                    </Badge>
                    {itemStockStatus[item.id] && (
                      <Badge 
                        variant={itemStockStatus[item.id].inStock ? "default" : "destructive"} 
                        className="text-xs"
                      >
                        {itemStockStatus[item.id].inStock 
                          ? `Stock: ${itemStockStatus[item.id].quantity}` 
                          : 'Out of Stock'
                        }
                      </Badge>
                    )}
                  </div>
                  
                  {/* Stock warning */}
                  {itemStockStatus[item.id] && !itemStockStatus[item.id].inStock && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">
                        ⚠️ This item is currently out of stock. Remove it to continue checkout.
                      </p>
                    </div>
                  )}
                  
                  {itemStockStatus[item.id] && itemStockStatus[item.id].inStock && item.quantity > itemStockStatus[item.id].quantity && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-600">
                        ⚠️ Only {itemStockStatus[item.id].quantity} items available. Quantity reduced.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quantity & Price */}
                <div className="flex flex-col items-end space-y-4">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    {(() => {
                      const productWithDiscounts = item.product as any;
                      const discountInfo = calculateDiscount(productWithDiscounts);
                      const itemPrice = discountInfo.isActive ? discountInfo.discountedPrice : item.product.price;
                      const totalPrice = itemPrice * item.quantity;
                      
                      return (
                        <>
                          <div className="text-sm text-gray-500">
                            {discountInfo.isActive ? (
                              <div>
                                <div className="line-through">Rs. {item.product.price.toLocaleString()} each</div>
                                <div className="text-red-600 font-medium">Rs. {itemPrice.toLocaleString()} each</div>
                              </div>
                            ) : (
                              <div>Rs. {item.product.price.toLocaleString()} each</div>
                            )}
                          </div>
                          <div className="text-lg font-bold text-amber-600">
                            Rs. {totalPrice.toLocaleString()}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Items ({getTotalItems()})</span>
              <span className="font-medium">Rs. {getOriginalTotalPrice().toLocaleString()}</span>
            </div>
            
            {getTotalDiscount() > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">-Rs. {getTotalDiscount().toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-amber-600">
                  Rs. {getTotalPrice().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/checkout" className="block">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/products" className="block">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>💰 Cash on Delivery Available</p>
            <p>🚚 Free delivery within Lahore, Pakistan</p>
            <p>🔄 Easy returns within 7 days</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
