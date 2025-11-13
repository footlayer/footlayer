import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../../lib/db';
import { syncMultipleProductsStockStatus } from '../../../../../lib/inventory-sync';

export const dynamic = 'force-dynamic';

// POST - Sync stock status for all products or specific products
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productIds } = body; // Optional: specific product IDs to sync

    let productsToSync: string[];

    if (productIds && Array.isArray(productIds)) {
      // Sync specific products
      productsToSync = productIds;
    } else {
      // Sync all products
      const allProducts = await prisma.product.findMany({
        select: { id: true }
      });
      productsToSync = allProducts.map(p => p.id);
    }

    if (productsToSync.length === 0) {
      return NextResponse.json({ 
        message: 'No products found to sync',
        syncedProducts: 0
      });
    }

    // Sync stock status for all products
    const results = await syncMultipleProductsStockStatus(productsToSync);

    const inStockCount = Object.values(results).filter(status => status === true).length;
    const outOfStockCount = Object.values(results).filter(status => status === false).length;

    return NextResponse.json({
      success: true,
      message: `Synced stock status for ${productsToSync.length} products`,
      syncedProducts: productsToSync.length,
      inStockCount,
      outOfStockCount,
      results
    });

  } catch (error) {
    console.error('Error syncing stock status:', error);
    return NextResponse.json({ error: 'Failed to sync stock status' }, { status: 500 });
  }
}
