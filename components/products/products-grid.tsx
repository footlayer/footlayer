
'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from './product-card';
import { Loading } from '../ui/loading';
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

export function ProductsGrid({ searchParams }: ProductsGridProps) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (searchParams.category) params.set('category', searchParams.category);
        if (searchParams.search) params.set('search', searchParams.search);
        if (searchParams.page) params.set('page', searchParams.page);
        
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
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {getCategoryTitle()}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {total} product{total !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <a
                    key={pageNum}
                    href={`?${new URLSearchParams({ ...searchParams, page: pageNum.toString() })}`}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === page
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
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
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V9a4 4 0 00-4-4H9a4 4 0 00-4 4v4h2m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}
