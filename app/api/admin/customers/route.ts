import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { city: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    // Get customers with pagination
    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          orders: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              status: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5 // Show only recent 5 orders
          },
          _count: {
            select: {
              orders: true,
              cartItems: true
            }
          }
        }
      }),
      prisma.customer.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Check if customer has orders
    const customerWithOrders = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: true
      }
    });

    if (!customerWithOrders) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    if (customerWithOrders.orders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders' },
        { status: 400 }
      );
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id: customerId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
