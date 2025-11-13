import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productIds = searchParams.get('ids');

    if (!productIds) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 });
    }

    // Parse the comma-separated product IDs (keep as strings since Product.id is String type)
    const ids = productIds.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Valid product IDs are required' }, { status: 400 });
    }

    // Fetch products with their stock information
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids
        }
      },
      select: {
        id: true,
        name: true,
        inStock: true
      }
    });

    // Create a response object with product stock status
    const stockStatus = products.reduce((acc, product) => {
      acc[product.id] = {
        id: product.id,
        name: product.name,
        inStock: product.inStock,
        inventory: null // Simplified for now
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      stockStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching product stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product stock' },
      { status: 500 }
    );
  }
}

// POST endpoint to update stock status for multiple products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body; // Array of { id, inStock } objects

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Updates array is required' }, { status: 400 });
    }

    // Update stock status for multiple products
    const updatePromises = updates.map(({ id, inStock }: { id: string; inStock: boolean }) =>
      prisma.product.update({
        where: { id },
        data: { inStock }
      })
    );

    const updatedProducts = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      updatedProducts: updatedProducts.map(p => ({
        id: p.id,
        name: p.name,
        inStock: p.inStock
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating product stock:', error);
    return NextResponse.json(
      { error: 'Failed to update product stock' },
      { status: 500 }
    );
  }
}
