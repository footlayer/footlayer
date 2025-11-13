
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Get cart items from localStorage
    const updateCartCount = () => {
      const cartItems = localStorage.getItem('footLayerCart');
      if (cartItems) {
        try {
          const items = JSON.parse(cartItems);
          const totalItems = items.reduce((total: number, item: any) => total + (item?.quantity || 0), 0);
          setCartItemCount(totalItems);
        } catch {
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };

    updateCartCount();
    
    // Listen for cart updates
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const [navCategories, setNavCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' });
        const json = await res.json();
        if (res.ok) {
          setNavCategories((json.categories || []).slice(0, 4));
        }
      } catch {
        // ignore fetch errors in header
      }
    })();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md ">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-32 w-32 sm:h-36 sm:w-36 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Foot Layer"
                  width={600}
                  height={600}
                  className="h-full w-full object-contain"
                  style={{
                    mixBlendMode: 'multiply',
                    filter: 'contrast(1.3) brightness(0.9) saturate(1.2)'
                  }}
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex items-center space-x-10">
                <li>
                  <Link href="/" className="text-lg font-bold text-gray-700 hover:text-amber-600 transition-colors">Home</Link>
                </li>
                <li>
                  <Link href="/products" className="text-lg font-bold text-gray-700 hover:text-amber-600 transition-colors">Products</Link>
                </li>
                {navCategories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/products?category=${encodeURIComponent(c.slug)}`}
                      className="text-lg font-bold text-gray-700 hover:text-amber-600 transition-colors"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/track-order" className="text-lg font-bold text-gray-700 hover:text-amber-600 transition-colors">Track Order</Link>
                </li>
              </ul>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Search className="h-4 w-4" />
              </Button> */}
              
              <Link href="/cart">
                <Button variant="ghost" size="lg" className="relative p-3 sm:p-4">
                  <ShoppingCart className="h-6 w-6 sm:h-5 sm:w-5" />
                  {cartItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[1.25rem] sm:-top-2 sm:-right-2 font-bold"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Button>
              </Link>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="lg"
                className="md:hidden p-3 sm:p-4"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay - Outside header */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Half-page overlay */}
          <div className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Navigation Links */}
              <div className="flex-1 px-6 py-6 space-y-1">
                <Link
                  href="/"
                  className="block px-4 py-4 rounded-lg text-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="block px-4 py-4 rounded-lg text-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                {navCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/products?category=${encodeURIComponent(c.slug)}`}
                    className="block px-4 py-4 rounded-lg text-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {c.name}
                  </Link>
                ))}
                <Link
                  href="/track-order"
                  className="block px-4 py-4 rounded-lg text-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Track Order
                </Link>
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-center">
                  <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      View Cart ({cartItemCount})
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
