
import { NextRequest, NextResponse } from 'next/server';
import { prisma, PrismaTransactionClient } from '../../../lib/db';
import { syncMultipleProductsStockStatus } from '../../../lib/inventory-sync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryCity,
      notes,
      items,
      totalAmount
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone || !deliveryAddress || !deliveryCity || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or find customer
    let customer = await prisma.customer.findFirst({
      where: { phone: customerPhone }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: customerEmail || `${customerPhone}@example.com`,
          phone: customerPhone,
          address: deliveryAddress,
          city: deliveryCity,
        }
      });
    }

    // Validate inventory availability and reduce stock
    const inventoryUpdates: Array<{ inventoryId: string; newQuantity: number }> = [];
    const insufficientStockItems: Array<{ productId: string; size: string; color: string; requested: number; available: number; reason: string }> = [];

    for (const item of items) {
      // Check if inventory item exists and has sufficient stock
      const inventoryItem = await (prisma as any).inventoryItem.findUnique({
        where: {
          productId_size_color: {
            productId: item.productId,
            size: item.size,
            color: item.color
          }
        }
      });

      if (!inventoryItem) {
        insufficientStockItems.push({
          productId: item.productId,
          size: item.size,
          color: item.color,
          requested: item.quantity,
          available: 0,
          reason: 'Product variant not found in inventory'
        });
        continue;
      }

      if (inventoryItem.quantity < item.quantity) {
        insufficientStockItems.push({
          productId: item.productId,
          size: item.size,
          color: item.color,
          requested: item.quantity,
          available: inventoryItem.quantity,
          reason: 'Insufficient stock'
        });
        continue;
      }

      // Add to inventory updates
      inventoryUpdates.push({
        inventoryId: inventoryItem.id,
        newQuantity: inventoryItem.quantity - item.quantity
      });
    }

    // If there are insufficient stock items, return error
    if (insufficientStockItems.length > 0) {
      return NextResponse.json({
        error: 'Insufficient stock for some items',
        insufficientStockItems
      }, { status: 400 });
    }

    // Generate order number
    const orderNumber = `FL${Date.now().toString().slice(-8)}`;

    // Get unique product IDs for stock sync
    const uniqueProductIds = [...new Set(items.map((item: any) => item.productId))] as string[];

    // Use transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Update inventory items
      for (const update of inventoryUpdates) {
        await (tx as any).inventoryItem.update({
          where: { id: update.inventoryId },
          data: { quantity: update.newQuantity }
        });
      }

      // Create order
      const createdOrder = await (tx as any).order.create({
        data: {
          customerId: customer!.id,
          orderNumber,
          totalAmount,
          deliveryAddress,
          deliveryCity,
          customerPhone,
          customerName,
          notes: notes || null,
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              price: item.price,
              discountAmount: item.discountAmount || 0,
              discountedPrice: item.discountedPrice || item.price
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });

      return createdOrder;
    });

    // Sync stock status for all affected products after transaction completes
    await syncMultipleProductsStockStatus(uniqueProductIds);

    return NextResponse.json({
      message: 'Order placed successfully',
      orderNumber: order.orderNumber,
      orderId: order.id
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to place order' },
      { status: 500 }
    );
  }
}
