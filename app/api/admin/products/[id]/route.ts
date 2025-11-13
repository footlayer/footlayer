import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { category: true } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = cookies().get('admin_session')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      imageUrl,
      categoryId,
      sizes,
      colors,
      inStock,
      featured,
      images,
    } = body ?? {};

    const errors: Record<string, string> = {};
    if (!name) errors.name = 'Name is required';
    if (!description) errors.description = 'Description is required';
    if (typeof price !== 'number' || Number.isNaN(price)) errors.price = 'Price must be a number';
    if (!imageUrl && (!Array.isArray(images) || images.length === 0)) errors.imageUrl = 'At least one image is required';
    if (!categoryId) errors.categoryId = 'Category is required';
    if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

    const category = await (prisma as any).category.findUnique({ where: { id: String(categoryId) } });
    if (!category) return NextResponse.json({ errors: { categoryId: 'Selected category does not exist' } }, { status: 400 });

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        imageUrl: imageUrl || (Array.isArray(images) && images[0]) || '',
        categoryId: String(categoryId),
        sizes: Array.isArray(sizes) ? sizes : [],
        colors: Array.isArray(colors) ? colors : [],
        inStock: Boolean(inStock),
        featured: Boolean(featured),
        images: Array.isArray(images) ? images : [],
      },
    });

    // Update inventory items for new size/color combinations
    const productSizes = Array.isArray(sizes) ? sizes : [];
    const productColors = Array.isArray(colors) ? colors : [];

    // Get existing inventory items
    const existingItems = await (prisma as any).inventoryItem.findMany({
      where: { productId: params.id },
      select: { size: true, color: true }
    });

    const existingCombinations = new Set(
      existingItems.map((item: any) => `${item.size}-${item.color}`)
    );

    // Create inventory items for new combinations
    for (const size of productSizes) {
      for (const color of productColors) {
        const combination = `${size}-${color}`;
        if (!existingCombinations.has(combination)) {
          await (prisma as any).inventoryItem.create({
            data: {
              productId: params.id,
              size,
              color,
              quantity: 0, // Default to 0 for new combinations
            },
          });
        }
      }
    }

    return NextResponse.json({ product: updated });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = cookies().get('admin_session')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}


