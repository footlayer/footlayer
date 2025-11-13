import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/db';
import { syncProductStockStatus } from '../../../../lib/inventory-sync';

export const dynamic = 'force-dynamic';

// GET - Fetch all inventory items for a specific product
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const inventoryItems = await (prisma as any).inventoryItem.findMany({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sizes: true,
            colors: true,
          }
        }
      },
      orderBy: [
        { size: 'asc' },
        { color: 'asc' }
      ]
    });

    return NextResponse.json({ inventoryItems });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

// POST - Create or update inventory items
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, inventoryUpdates } = body;

    if (!productId || !Array.isArray(inventoryUpdates)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sizes: true, colors: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const results = [];

    for (const update of inventoryUpdates) {
      const { size, color, quantity } = update;

      // Validate size and color are available for this product
      if (!product.sizes.includes(size)) {
        return NextResponse.json({ error: `Size ${size} is not available for this product` }, { status: 400 });
      }
      if (!product.colors.includes(color)) {
        return NextResponse.json({ error: `Color ${color} is not available for this product` }, { status: 400 });
      }

      // Upsert inventory item
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
        },
        include: {
          product: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      results.push(inventoryItem);
    }

    // Sync the product's stock status based on updated inventory
    const newStockStatus = await syncProductStockStatus(productId);

    return NextResponse.json({ 
      inventoryItems: results,
      stockStatus: newStockStatus,
      message: `Inventory updated. Product is now ${newStockStatus ? 'IN STOCK' : 'OUT OF STOCK'}`
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}

// DELETE - Delete inventory item
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const inventoryId = searchParams.get('id');

    if (!inventoryId) {
      return NextResponse.json({ error: 'Inventory ID is required' }, { status: 400 });
    }

    // Get the inventory item to find the product ID before deleting
    const inventoryItem = await (prisma as any).inventoryItem.findUnique({
      where: { id: inventoryId },
      select: { productId: true }
    });

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    // Delete the inventory item
    await (prisma as any).inventoryItem.delete({
      where: { id: inventoryId }
    });

    // Sync the product's stock status after deletion
    const newStockStatus = await syncProductStockStatus(inventoryItem.productId);

    return NextResponse.json({ 
      success: true,
      stockStatus: newStockStatus,
      message: `Inventory item deleted. Product is now ${newStockStatus ? 'IN STOCK' : 'OUT OF STOCK'}`
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
