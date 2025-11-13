
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Product } from '../../lib/types';
import { useToast } from '../../hooks/use-toast';
import { calculateDiscount, formatDiscountDisplay } from '../../lib/discount-utils';
import { useSingleProductStock } from '../../hooks/use-product-stock-simple';

interface ProductCardProps {
  product: Product;
  delay?: number;
}

export function ProductCard({ product, delay = 0 }: ProductCardProps) {
  const { toast } = useToast();
  const productWithDiscounts = product as any;
  const discountInfo = calculateDiscount(productWithDiscounts);
  
  // Fetch real-time stock status
  const { stockStatus, loading: stockLoading } = useSingleProductStock(product.id);
  
  // Use API stock status if available, otherwise fallback to product.inStock
  const isInStock = stockStatus ? stockStatus.inStock : product.inStock;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const cartItems = JSON.parse(localStorage.getItem('footLayerCart') || '[]');
      const defaultSize = product.sizes[0] || '40';
      const defaultColor = product.colors[0] || 'Default';
      
      const existingItem = cartItems.find((item: any) => 
        item.productId === product.id && 
        item.size === defaultSize && 
        item.color === defaultColor
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cartItems.push({
          id: Date.now().toString(),
          productId: product.id,
          quantity: 1,
          size: defaultSize,
          color: defaultColor,
          product: product
        });
      }

      localStorage.setItem('footLayerCart', JSON.stringify(cartItems));
      
      // Dispatch custom event to update cart count
      window.dispatchEvent(new Event('cartUpdated'));

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCategoryLabel = (category: any) => {
    // Handle both old enum format and new object format
    if (typeof category === 'string') {
      switch (category) {
        case 'LOAFERS': return 'Loafers';
        case 'PESHAWARI': return 'Peshawari';
        case 'SANDALS': return 'Sandals';
        case 'SAUDI': return 'Saudi Chappals';
        default: return category;
      }
    }
    
    // Handle new object format
    if (category && typeof category === 'object' && category.name) {
      return category.name;
    }
    
    return 'Category';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="group relative"
    >
      <Link href={`/products/${product.id}`}>
        <div className="product-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {/* Image Container */}
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
                {getCategoryLabel((product as any).category)}
              </Badge>
            </div>

            {/* Discount Badge */}
            {discountInfo.isActive && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-red-500 text-white text-xs font-bold shadow-lg animate-pulse">
                  {formatDiscountDisplay(productWithDiscounts)}
                </Badge>
              </div>
            )}

            {/* Out of Stock Overlay */}
            {!isInStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <Badge className="bg-red-600 text-white text-sm font-bold px-4 py-2">
                  Out of Stock
                </Badge>
              </div>
            )}

            {/* Quick Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    // Quick view functionality could be added here
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
                  onClick={addToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-amber-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {discountInfo.isActive ? (
                  <>
                    <div className="text-lg font-bold text-amber-600">
                      Rs. {discountInfo.discountedPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      Rs. {discountInfo.originalPrice.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 font-semibold">
                      Save Rs. {discountInfo.discountAmount.toLocaleString()}
                    </div>
                  </>
                ) : (
                  <div className="text-lg font-bold text-amber-600">
                    Rs. {product.price.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {product.colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300 bg-gradient-to-br from-amber-100 to-amber-200"
                    title={color}
                  />
                ))}
                {product.colors.length > 3 && (
                  <span className="text-xs text-gray-500 ml-1">
                    +{product.colors.length - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-gray-500">
                Sizes: {product.sizes.slice(0, 3).join(', ')}
                {product.sizes.length > 3 && '...'}
              </div>
              {isInStock ? (
                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                  ✓ In Stock
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50">
                  ✗ Out of Stock
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
