import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../../lib/db';
import { syncProductStockStatus } from '../../../../../lib/inventory-sync';

export const dynamic = 'force-dynamic';

// POST - Bulk update inventory for all size/color combinations of a product
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, inventoryMatrix } = body;

    if (!productId || !inventoryMatrix) {
      return NextResponse.json({ error: 'Product ID and inventory matrix are required' }, { status: 400 });
    }

    // Verify product exists and get its sizes/colors
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sizes: true, colors: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const results = [];

    // Process each size/color combination
    for (const size of product.sizes) {
      for (const color of product.colors) {
        const quantity = inventoryMatrix[size]?.[color] || 0;

        // Only process non-negative quantities
        if (quantity >= 0) {
          try {
            const inventoryItem = await (prisma as any).inventoryItem.upsert({
              where: {
                productId_size_color: {
                  productId,
                  size,
                  color
                }
              },
              update: {
                quantity: Math.max(0, quantity) // Ensure non-negative
              },
              create: {
                productId,
                size,
                color,
                quantity: Math.max(0, quantity)
              }
            });

            results.push(inventoryItem);
          } catch (error) {
            console.error(`Error updating inventory for ${productId}, size ${size}, color ${color}:`, error);
            // Continue with other items even if one fails
          }
        }
      }
    }

    // Sync the product's stock status based on updated inventory
    const newStockStatus = await syncProductStockStatus(productId);

    return NextResponse.json({ 
      success: true, 
      inventoryItems: results,
      stockStatus: newStockStatus,
      message: `Updated inventory for ${product.name}. Product is now ${newStockStatus ? 'IN STOCK' : 'OUT OF STOCK'}`
    });
  } catch (error) {
    console.error('Error bulk updating inventory:', error);
    return NextResponse.json({ error: 'Failed to bulk update inventory' }, { status: 500 });
  }
}
