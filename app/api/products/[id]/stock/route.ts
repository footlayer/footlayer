import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

export const dynamic = 'force-dynamic';

// GET - Check stock for specific product variants (size/color combinations)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const size = searchParams.get('size');
    const color = searchParams.get('color');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get product with all its inventory items
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        sizes: true,
        colors: true,
        inStock: true,
        inventoryItems: {
          select: {
            size: true,
            color: true,
            quantity: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // If specific size and color are requested, check that variant
    if (size && color) {
      const variant = product.inventoryItems.find(
        item => item.size === size && item.color === color
      );

      return NextResponse.json({
        productId: product.id,
        productName: product.name,
        size,
        color,
        inStock: variant ? variant.quantity > 0 : false,
        quantity: variant ? variant.quantity : 0,
        availableQuantity: variant ? variant.quantity : 0,
        reservedQuantity: 0 // Not implemented yet
      });
    }

    // Return stock status for all size/color combinations
    const stockMatrix: Record<string, Record<string, {
      inStock: boolean;
      quantity: number;
      availableQuantity: number;
      reservedQuantity: number;
    }>> = {};

    // Initialize matrix with all possible combinations
    for (const size of product.sizes) {
      stockMatrix[size] = {};
      for (const color of product.colors) {
        stockMatrix[size][color] = {
          inStock: false,
          quantity: 0,
          availableQuantity: 0,
          reservedQuantity: 0
        };
      }
    }

    // Fill in actual inventory data
    for (const item of product.inventoryItems) {
      if (stockMatrix[item.size] && stockMatrix[item.size][item.color]) {
        stockMatrix[item.size][item.color] = {
          inStock: item.quantity > 0,
          quantity: item.quantity,
          availableQuantity: item.quantity,
          reservedQuantity: 0 // Not implemented yet
        };
      }
    }

    return NextResponse.json({
      productId: product.id,
      productName: product.name,
      sizes: product.sizes,
      colors: product.colors,
      overallInStock: product.inStock,
      stockMatrix
    });

  } catch (error) {
    console.error('Error fetching product stock:', error);
    return NextResponse.json({ error: 'Failed to fetch product stock' }, { status: 500 });
  }
}
