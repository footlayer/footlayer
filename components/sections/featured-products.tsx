
import { prisma } from '../../lib/db';
import { ProductCard } from '../products/product-card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import type { Product } from '../../lib/types';

export async function FeaturedProducts() {
  const featuredProducts = await prisma.product.findMany({
    where: {
      featured: true
    },
    take: 8,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <section className="py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked premium footwear that combines traditional craftsmanship 
            with modern comfort
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product: Product, index: number) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              delay={index * 0.1}
            />
          ))}
        </div>

        <div className="text-center">
          <Link href="/products">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-amber-600 text-amber-600 hover:bg-amber-50"
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
