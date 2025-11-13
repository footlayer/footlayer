
import { prisma } from '../../../lib/db';
import { notFound } from 'next/navigation';
import { ProductDetail } from '../../../components/products/product-detail';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id }
  });

  if (!product) {
    return {
      title: 'Product Not Found - Foot Layer'
    };
  }

  return {
    title: `${product.name} - Foot Layer`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id }
  });

  if (!product) {
    notFound();
  }

  // Get related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id }
    },
    take: 4,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-white">
      <ProductDetail 
        product={product} 
        relatedProducts={relatedProducts} 
      />
    </div>
  );
}
