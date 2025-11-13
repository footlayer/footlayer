import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

// GET - Track order by order number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }

    // Find order by order number
    const order = await (prisma as any).order.findUnique({
      where: { orderNumber },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
                sizes: true,
                colors: true,
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 });
  }
}
