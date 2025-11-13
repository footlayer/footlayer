'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from './product-card';
import { Loading } from '../ui/loading';
import { useProductStock } from '../../hooks/use-product-stock-simple';

interface ProductWithCategory {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  categoryId: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  // Discount fields
  discountPercentage?: number;
  discountAmount?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  isDiscounted: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

interface ProductsGridProps {
  searchParams: {
    category?: string;
    search?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

interface ProductsResponse {
  products: ProductWithCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function ProductsGridWithStock({ searchParams }: ProductsGridProps) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract product IDs for stock fetching
  const productIds = data?.products?.map(p => p.id) || [];
  
  // Fetch stock status for all products
  const { stockStatus, loading: stockLoading, refetch: refetchStock } = useProductStock(productIds);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (searchParams.category) params.set('category', searchParams.category);
        if (searchParams.search) params.set('search', searchParams.search);
        if (searchParams.page) params.set('page', searchParams.page);
        if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
        if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
        
        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  // Refetch stock status when products change
  useEffect(() => {
    if (productIds.length > 0) {
      refetchStock();
    }
  }, [productIds.length, refetchStock]);

  if (loading) {
    return <Loading text="Loading products..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading products</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { products, pagination } = data;
  const { page, total, totalPages } = pagination;

  const getCategoryTitle = () => {
    if (searchParams.search) return `Search results for "${searchParams.search}"`;
    if (searchParams.category && products.length > 0) {
      const category = products[0].category;
      return category && category.name 
        ? category.name 
        : 'Category';
    }
    return 'All Products';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Results Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {getCategoryTitle()}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {total} product{total !== 1 ? 's' : ''} found
              {stockLoading && (
                <span className="ml-2 text-amber-600">• Updating stock status...</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product, index) => {
                // Convert serialized dates back to Date objects for ProductCard
                const productForCard = {
                  ...product,
                  createdAt: new Date(product.createdAt),
                  updatedAt: new Date(product.updatedAt),
                  discountPercentage: product.discountPercentage ?? null,
                  discountAmount: product.discountAmount ?? null,
                  discountStartDate: product.discountStartDate ? new Date(product.discountStartDate) : null,
                  discountEndDate: product.discountEndDate ? new Date(product.discountEndDate) : null,
                  isDiscounted: product.isDiscounted ?? false
                };
                return (
                  <ProductCard 
                    key={product.id} 
                    product={productForCard} 
                    delay={index * 0.05}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <a
                      key={pageNum}
                      href={`?${new URLSearchParams({ ...searchParams, page: pageNum.toString() })}`}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pageNum === page
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-amber-300'
                      }`}
                    >
                      {pageNum}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search terms or price filters.</p>
            <button
              onClick={() => window.location.href = '/products'}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
