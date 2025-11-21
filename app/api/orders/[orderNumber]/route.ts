
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { 
        orderNumber: params.orderNumber 
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        deliveryCity: order.deliveryCity,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        notes: order.notes,
        orderItems: order.orderItems.map((item: { id: string; productId: string; quantity: number; size: string; color: string; price: number; discountAmount: number | null; discountedPrice: number; product: { id: string; name: string; imageUrl: string | null } }) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.price,
          discountAmount: item.discountAmount || 0,
          discountedPrice: item.discountedPrice || item.price,
          product: {
            id: item.product.id,
            name: item.product.name,
            imageUrl: item.product.imageUrl
          }
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}
