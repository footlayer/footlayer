import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch all orders with pagination and search
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') || '';

    const where: any = {};
    
    if (query) {
      where.OR = [
        { orderNumber: { contains: query, mode: 'insensitive' } },
        { customerName: { contains: query, mode: 'insensitive' } },
        { customerPhone: { contains: query, mode: 'insensitive' } },
        { deliveryAddress: { contains: query, mode: 'insensitive' } },
        { deliveryCity: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      (prisma as any).order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
                }
              }
            }
          }
        },
      }),
      (prisma as any).order.count({ where }),
    ]);

    return NextResponse.json({ orders, total });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
