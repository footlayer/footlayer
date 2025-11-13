
import { Suspense } from 'react';
import { ProductsGridWithStock } from '../../components/products/products-grid-with-stock';
import { ProductsFilter } from '../../components/products/products-filter';
import { Loading } from '../../components/ui/loading';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    featured?: string;
    onSale?: string;
    sizes?: string;
    colors?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Our Collection
          </h1>
          <p className="text-lg text-gray-600">
            Discover premium footwear crafted with tradition and passion
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <ProductsFilter />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-4">
            <Suspense fallback={<Loading text="Loading products..." />}>
              <ProductsGridWithStock searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
