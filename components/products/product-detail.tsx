
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, ArrowLeft, ArrowRight, X, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Product } from '../../lib/types';
import { useToast } from '../../hooks/use-toast';
import { ProductCard } from './product-card';
import { calculateDiscount, formatDiscountDisplay } from '../../lib/discount-utils';
import { useSingleProductStock } from '../../hooks/use-product-stock-simple';
import { useProductVariantStock } from '../../hooks/use-product-variant-stock';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '40');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  // Cast product to include discount fields since Prisma client might not be updated
  const productWithDiscounts = product as any;
  const discountInfo = calculateDiscount(productWithDiscounts);
  
  // Fetch real-time stock status
  const { stockStatus, loading: stockLoading } = useSingleProductStock(product.id);
  
  // Fetch variant-specific stock data
  const { 
    stockData, 
    loading: variantStockLoading,
    getVariantStock,
    isVariantInStock,
    getAvailableSizes,
    getAvailableColors 
  } = useProductVariantStock(product.id);
  
  // Use API stock status if available, otherwise fallback to product.inStock
  const isInStock = stockStatus ? stockStatus.inStock : product.inStock;
  
  // Check if selected variant is in stock
  const selectedVariantInStock = isVariantInStock(selectedSize, selectedColor);
  const selectedVariantStock = getVariantStock(selectedSize, selectedColor);

  // Auto-select first available variant if current selection is out of stock
  useEffect(() => {
    if (stockData && !selectedVariantInStock) {
      // Try to find first available size/color combination
      for (const size of stockData.sizes) {
        for (const color of stockData.colors) {
          if (isVariantInStock(size, color)) {
            setSelectedSize(size);
            setSelectedColor(color);
            return;
          }
        }
      }
    }
  }, [stockData, selectedVariantInStock, isVariantInStock]);
  // Create images array ensuring primary image is first and no duplicates
  const galleryImages = (product as any).images || [];
  const images = [product.imageUrl, ...galleryImages.filter((img: string) => img !== product.imageUrl)].filter(Boolean) as string[];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState<{x:string;y:string}>({ x: '50%', y: '50%' });
  const mobileSliderRef = useRef<HTMLDivElement>(null);

  const goPrev = () => setActiveIndex((idx) => (idx - 1 + images.length) % images.length);
  const goNext = () => setActiveIndex((idx) => (idx + 1) % images.length);

  const openLightboxIfDesktop = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setLightboxOpen(true);
    }
  };

  // Handle mobile slider scroll to update active index
  useEffect(() => {
    const slider = mobileSliderRef.current;
    if (!slider) return;

    const handleScroll = () => {
      const scrollLeft = slider.scrollLeft;
      const itemWidth = slider.clientWidth;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setActiveIndex(newIndex);
    };

    slider.addEventListener('scroll', handleScroll);
    return () => slider.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle dot navigation for mobile
  const goToSlide = (index: number) => {
    setActiveIndex(index);
    if (mobileSliderRef.current) {
      const itemWidth = mobileSliderRef.current.clientWidth;
      mobileSliderRef.current.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      });
    }
  };

  const addToCart = () => {
    try {
      // Validate variant stock before adding to cart
      if (!selectedVariantInStock) {
        toast({
          title: "Out of Stock",
          description: `${selectedSize} ${selectedColor} is currently out of stock.`,
          variant: "destructive",
        });
        return;
      }

      // Check if requested quantity is available
      if (quantity > selectedVariantStock.quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${selectedVariantStock.quantity} items available for ${selectedSize} ${selectedColor}.`,
          variant: "destructive",
        });
        return;
      }

      const cartItems = JSON.parse(localStorage.getItem('footLayerCart') || '[]');
      
      const existingItem = cartItems.find((item: any) => 
        item.productId === product.id && 
        item.size === selectedSize && 
        item.color === selectedColor
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > selectedVariantStock.quantity) {
          toast({
            title: "Insufficient Stock",
            description: `Only ${selectedVariantStock.quantity} items available for ${selectedSize} ${selectedColor}. You already have ${existingItem.quantity} in cart.`,
            variant: "destructive",
          });
          return;
        }
        existingItem.quantity = newQuantity;
      } else {
        cartItems.push({
          id: Date.now().toString(),
          productId: product.id,
          quantity,
          size: selectedSize,
          color: selectedColor,
          product: product
        });
      }

      localStorage.setItem('footLayerCart', JSON.stringify(cartItems));
      
      // Dispatch custom event to update cart count
      window.dispatchEvent(new Event('cartUpdated'));

      toast({
        title: "Added to cart",
        description: `${product.name} (${selectedSize}, ${selectedColor}) has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing failed', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link has been copied to clipboard.",
      });
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'LOAFERS': return 'Loafers';
      case 'PESHAWARI': return 'Peshawari Chappals';
      case 'SANDALS': return 'Sandals';
      case 'SAUDI': return 'Saudi Chappals';
      default: return category;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link 
        href="/products" 
        className="hidden sm:inline-flex items-center text-gray-600 hover:text-amber-600 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Link>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
        {/* Product Images */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 lg:mb-0"
        >
          <div className="grid grid-cols-6 gap-4 items-start">
            {/* Vertical thumbnails (desktop) */}
            {images.length > 0 && (
              <div className="hidden lg:block col-span-1 max-h-[770px] overflow-auto space-y-3 pr-1">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-full pt-[100%] rounded-md overflow-hidden border transition-colors ${
                      activeIndex === idx ? 'border-amber-600' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span className="absolute inset-0">
                      <Image src={src} alt={`Thumb ${idx+1}`} fill className="object-cover" />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Main image area */}
            <div className="col-span-6 lg:col-span-5">
              {/* Desktop/Large screens - slider with arrows */}
              <div className="relative hidden lg:block w-full h-[700px] xl:h-[770px] bg-white rounded-2xl shadow-lg overflow-hidden">
                <div
                  className="flex h-full transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  {images.length > 0 ? images.map((src, idx) => (
                    <div key={idx} className="relative h-full min-w-full shrink-0">
                      <Image
                        src={src}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        priority={idx === 0}
                        sizes="(min-width: 1536px) 860px, (min-width: 1280px) 700px, 560px"
                        className="object-contain cursor-zoom-in"
                        onClick={openLightboxIfDesktop}
                      />
                    </div>
                  )) : (
                    <div className="flex items-center justify-center w-full text-gray-400">No image</div>
                  )}
                </div>
                {/* arrows */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button aria-label="Previous image" onClick={goPrev} className="h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow border border-gray-200 flex items-center justify-center">
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button aria-label="Next image" onClick={goNext} className="h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow border border-gray-200 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile/Tablet - swipeable slider with snap */}
              <div 
                ref={mobileSliderRef}
                className="relative block lg:hidden w-full h-[520px] sm:h-[580px] bg-white rounded-2xl shadow-lg overflow-x-auto overflow-y-hidden snap-x snap-mandatory"
              >
                <div className="flex h-full w-max">
                  {images.map((src, idx) => (
                    <div key={idx} className="relative h-full w-screen snap-center">
                      <Image 
                        src={src} 
                        alt={`${product.name} ${idx + 1}`} 
                        fill 
                        sizes="100vw" 
                        className="object-contain" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile thumbnails removed per request; using dots + swipe */}

              {/* Mobile dots */}
              {images.length > 1 && (
                <div className="lg:hidden mt-2 flex items-center justify-center gap-2 pb-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Go to image ${idx + 1}`}
                      onClick={() => goToSlide(idx)}
                      className={`h-2.5 w-2.5 rounded-full ${activeIndex === idx ? 'bg-amber-600' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Category */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {getCategoryLabel((product as any).category)}
            </Badge>
          </div>

          {/* Title & Price */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <div className="mb-4">
              {discountInfo.isActive ? (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-amber-600">
                    Rs. {discountInfo.discountedPrice.toLocaleString()}
                  </div>
                  <div className="text-xl text-gray-500 line-through">
                    Rs. {discountInfo.originalPrice.toLocaleString()}
                  </div>
                  <Badge className="bg-red-500 text-white">
                    {formatDiscountDisplay(productWithDiscounts)}
                  </Badge>
                </div>
              ) : (
                <div className="text-3xl font-bold text-amber-600">
                  Rs. {product.price.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Size Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => {
                const sizeInStock = stockData ? getAvailableColors(size).length > 0 : true;
                const isDisabled = !sizeInStock;
                
                return (
                  <button
                    key={size}
                    onClick={() => sizeInStock && setSelectedSize(size)}
                    disabled={isDisabled}
                    className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                      selectedSize === size
                        ? 'border-amber-600 bg-amber-50 text-amber-600'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                    {isDisabled && (
                      <span className="ml-1 text-xs">(Out of Stock)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => {
                const colorInStock = stockData ? isVariantInStock(selectedSize, color) : true;
                const isDisabled = !colorInStock;
                
                return (
                  <button
                    key={color}
                    onClick={() => colorInStock && setSelectedColor(color)}
                    disabled={isDisabled}
                    className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                      selectedColor === color
                        ? 'border-amber-600 bg-amber-50 text-amber-600'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {color}
                    {isDisabled && (
                      <span className="ml-1 text-xs">(Out of Stock)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            {selectedVariantInStock ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">
                  In Stock 
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-600 font-medium">
                  Out of Stock - {selectedSize} {selectedColor}
                </span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={addToCart}
              disabled={!selectedVariantInStock}
              size="lg"
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {selectedVariantInStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="px-4">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={shareProduct} className="px-4">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-gray-600">Free delivery within Lahore, Pakistan</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-gray-600">Authentic handcrafted quality</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct, index) => (
              <ProductCard 
                key={relatedProduct.id} 
                product={relatedProduct} 
                delay={index * 0.1}
              />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button 
            aria-label="Close" 
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center z-10" 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative w-full max-w-6xl h-[80vh] bg-white rounded-xl overflow-hidden cursor-zoom-in"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setZoomOrigin({ x: `${x}%`, y: `${y}%` });
            }}
          >
            <Image 
              key={images[activeIndex]}
              src={images[activeIndex]} 
              alt={`${product.name} enlarged`} 
              fill 
              sizes="100vw" 
              className="object-contain" 
              style={{ transform: 'scale(1.5)', transformOrigin: `${zoomOrigin.x} ${zoomOrigin.y}` }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
