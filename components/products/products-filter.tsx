
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { X, Search, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const priceRanges = [
  { label: 'Under Rs. 3,000', min: 0, max: 3000 },
  { label: 'Rs. 3,000 - Rs. 5,000', min: 3000, max: 5000 },
  { label: 'Rs. 5,000 - Rs. 8,000', min: 5000, max: 8000 },
  { label: 'Above Rs. 8,000', min: 8000, max: Infinity }
];

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function ProductsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function for real-time search like social media apps
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (term.trim()) {
        params.set('search', term.trim());
      } else {
        params.delete('search');
      }
      
      // Apply price filters
      if (selectedPriceRanges.length > 0) {
        const [min, max] = selectedPriceRanges[0].split('-').map(Number);
        params.set('minPrice', min.toString());
        
        // Handle Infinity case for "Above Rs. 8,000"
        if (max === Infinity || isNaN(max)) {
          params.delete('maxPrice'); // Don't set maxPrice for "above" ranges
        } else {
          params.set('maxPrice', max.toString());
        }
      } else {
        params.delete('minPrice');
        params.delete('maxPrice');
      }
      
      params.delete('page'); // Reset to first page
      router.push(`?${params.toString()}`);
      setIsSearching(false);
    }, 500), // 500ms delay like social media apps
    [searchParams, selectedPriceRanges, router]
  );

  // Real-time search effect
  useEffect(() => {
    if (searchTerm !== searchParams.get('search')) {
      setIsSearching(true);
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch, searchParams]);

  // Initialize price ranges from URL
  useEffect(() => {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    if (minPrice) {
      const min = parseInt(minPrice);
      const max = maxPrice ? parseInt(maxPrice) : Infinity;
      
      // Find matching price ranges
      const matchingRanges = priceRanges.filter(range => {
        if (range.max === Infinity && max === Infinity) {
          return min >= range.min;
        }
        if (range.max === Infinity) {
          return false; // URL has maxPrice but range doesn't
        }
        if (max === Infinity) {
          return min >= range.min; // URL has no maxPrice, check if range matches
        }
        return min >= range.min && max <= range.max;
      });
      
      if (matchingRanges.length > 0) {
        setSelectedPriceRanges(
          matchingRanges.map(range => `${range.min}-${range.max}`)
        );
      }
    } else {
      setSelectedPriceRanges([]);
    }
  }, [searchParams]);

  const handlePriceRangeChange = (range: string, checked: boolean) => {
    let newRanges: string[];
    if (checked) {
      // Only allow one price range at a time for better UX
      newRanges = [range];
    } else {
      newRanges = [];
    }
    
    setSelectedPriceRanges(newRanges);
    
    // Apply price filter immediately
    const params = new URLSearchParams(searchParams.toString());
    
    if (newRanges.length > 0) {
      const [min, max] = newRanges[0].split('-').map(Number);
      
      params.set('minPrice', min.toString());
      
      // Handle Infinity case for "Above Rs. 8,000"
      if (max === Infinity || isNaN(max)) {
        params.delete('maxPrice'); // Don't set maxPrice for "above" ranges
      } else {
        params.set('maxPrice', max.toString());
      }
    } else {
      params.delete('minPrice');
      params.delete('maxPrice');
    }
    
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPriceRanges([]);
    router.push('/products');
  };

  const hasActiveFilters = searchTerm || selectedPriceRanges.length > 0;

  return (
    <div className="space-y-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-start"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-auto">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Search */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Search Products</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Search by product name or description
          </p>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Active Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedPriceRanges.map((range) => (
                <Badge key={range} variant="secondary" className="flex items-center gap-1">
                  {priceRanges.find(r => `${r.min}-${r.max}` === range)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handlePriceRangeChange(range, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Price Ranges */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
          <div className="space-y-3">
            {/* Clear option */}
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="priceRange"
                checked={selectedPriceRanges.length === 0}
                onChange={() => handlePriceRangeChange('', false)}
                className="border-gray-300 text-amber-600 focus:ring-amber-500 focus:ring-2"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                All Prices
              </span>
            </label>
            
            {priceRanges.map((range, index) => {
              const rangeKey = `${range.min}-${range.max}`;
              return (
                <label key={index} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={selectedPriceRanges.includes(rangeKey)}
                    onChange={() => handlePriceRangeChange(rangeKey, true)}
                    className="border-gray-300 text-amber-600 focus:ring-amber-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    {range.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
