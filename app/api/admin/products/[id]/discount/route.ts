import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      discountPercentage, 
      discountAmount, 
      discountStartDate, 
      discountEndDate, 
      isDiscounted,
      discountType 
    } = body;

    // Validate discount data
    if (isDiscounted) {
      if (discountType === 'percentage' && (!discountPercentage || discountPercentage <= 0 || discountPercentage > 100)) {
        return NextResponse.json(
          { error: 'Invalid discount percentage (must be between 0 and 100)' },
          { status: 400 }
        );
      }
      
      if (discountType === 'amount' && (!discountAmount || discountAmount <= 0)) {
        return NextResponse.json(
          { error: 'Invalid discount amount (must be greater than 0)' },
          { status: 400 }
        );
      }

      if (discountStartDate && discountEndDate && new Date(discountStartDate) >= new Date(discountEndDate)) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Update product with discount information
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        discountPercentage: isDiscounted && discountType === 'percentage' ? discountPercentage : null,
        discountAmount: isDiscounted && discountType === 'amount' ? discountAmount : null,
        discountStartDate: isDiscounted && discountStartDate ? new Date(discountStartDate) : null,
        discountEndDate: isDiscounted && discountEndDate ? new Date(discountEndDate) : null,
        isDiscounted: isDiscounted,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product discount:', error);
    return NextResponse.json(
      { error: 'Failed to update product discount' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Remove discount from product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        discountPercentage: null,
        discountAmount: null,
        discountStartDate: null,
        discountEndDate: null,
        isDiscounted: false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error removing product discount:', error);
    return NextResponse.json(
      { error: 'Failed to remove product discount' },
      { status: 500 }
    );
  }
}
