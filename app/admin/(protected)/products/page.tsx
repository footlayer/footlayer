import { prisma } from '../../../../lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../../../components/ui/button';
import { DeleteProductButton } from '../../../../components/admin/delete-product-button';
import { AdminProductsSearch } from '../../../../components/admin/admin-products-search';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: { q?: string; page?: string; limit?: string };
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const query = (searchParams?.q || '').trim();
  const page = Math.max(parseInt(searchParams?.page || '1', 10) || 1, 1);
  const limit = 9; // fixed page size for admin view
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    (prisma as any).product.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' }, 
      skip, 
      take: limit, 
      include: { 
        category: true,
        inventoryItems: true
      } 
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', String(nextPage));
    params.set('limit', String(limit));
    return `/admin/products?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage all store products</p>
        </div>
        <div className="flex items-center gap-3">
          <AdminProductsSearch initialQuery={query} />
          <Link href="/admin/products/new">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">Add Product</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Total Stock</th>
                <th className="px-4 py-3">Low Stock</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-gray-50 rounded overflow-hidden">
                        <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{/* p.category is relation now */}{/* @ts-ignore */}
                    { /* @ts-ignore */ (p as any).category?.name ?? '—' }
                  </td>
                  <td className="px-4 py-3">Rs. {p.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {p.inventoryItems?.reduce((total: number, item: any) => total + item.quantity, 0) || 0}
                  </td>
                  <td className="px-4 py-3">
                    {p.inventoryItems?.filter((item: any) => item.quantity <= 5 && item.quantity > 0).length || 0}
                  </td>
                  <td className="px-4 py-3">{p.featured ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/admin/products/edit/${p.id}`} className="text-amber-700 hover:text-amber-900 mr-3">Edit</Link>
                    <DeleteProductButton productId={p.id} />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages} • {total} total
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" disabled={!hasPrev}>
            <Link href={hasPrev ? buildHref(page - 1) : '#'} aria-disabled={!hasPrev}>Previous</Link>
          </Button>
          <Button asChild variant="outline" disabled={!hasNext}>
            <Link href={hasNext ? buildHref(page + 1) : '#'} aria-disabled={!hasNext}>Next</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


