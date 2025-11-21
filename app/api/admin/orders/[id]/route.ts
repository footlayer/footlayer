import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../../lib/db';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET - Fetch single order with full details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await (prisma as any).order.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
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
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = [
      'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 
      'CANCELLED', 'RETURNED', 'PAYMENT_PENDING', 'PAYMENT_FAILED', 'REFUNDED'
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ') 
      }, { status: 400 });
    }

    // Check if order exists
    const existingOrder = await (prisma as any).order.findUnique({
      where: { id: params.id },
      include: {
        orderItems: true
      }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Handle inventory restoration for returns
    let updatedOrder;
    if (status === 'RETURNED' && existingOrder.status !== 'RETURNED') {
      // Use transaction to restore inventory and update status
      updatedOrder = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Restore inventory for each order item
        for (const orderItem of existingOrder.orderItems) {
          const inventoryItem = await (tx as any).inventoryItem.findUnique({
            where: {
              productId_size_color: {
                productId: orderItem.productId,
                size: orderItem.size,
                color: orderItem.color
              }
            }
          });

          if (inventoryItem) {
            await (tx as any).inventoryItem.update({
              where: { id: inventoryItem.id },
              data: { 
                quantity: inventoryItem.quantity + orderItem.quantity 
              }
            });
          }
        }

        // Update order status
        return await (tx as any).order.update({
          where: { id: params.id },
          data: { 
            status,
            updatedAt: new Date()
          },
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
          }
        });
      });
    } else {
      // Regular status update
      updatedOrder = await (prisma as any).order.update({
        where: { id: params.id },
        data: { 
          status,
          updatedAt: new Date()
        },
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
        }
      });
    }

    return NextResponse.json({ 
      order: updatedOrder,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE - Cancel order (soft delete by setting status to CANCELLED)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get order with items first
    const order = await (prisma as any).order.findUnique({
      where: { id: params.id },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only restore inventory if order was not already cancelled
    if (order.status !== 'CANCELLED') {
      // Use transaction to ensure atomicity
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Restore inventory for each order item
        for (const orderItem of order.orderItems) {
          const inventoryItem = await (tx as any).inventoryItem.findUnique({
            where: {
              productId_size_color: {
                productId: orderItem.productId,
                size: orderItem.size,
                color: orderItem.color
              }
            }
          });

          if (inventoryItem) {
            await (tx as any).inventoryItem.update({
              where: { id: inventoryItem.id },
              data: { 
                quantity: inventoryItem.quantity + orderItem.quantity 
              }
            });
          }
        }

        // Update order status
        await (tx as any).order.update({
          where: { id: params.id },
          data: { 
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        });
      });
    } else {
      // Just update the status if already cancelled
      await (prisma as any).order.update({
        where: { id: params.id },
        data: { 
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({ 
      message: 'Order cancelled successfully and inventory restored',
      order: { id: params.id, status: 'CANCELLED' }
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
