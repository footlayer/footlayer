import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch all products with inventory
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
    const limit = parseInt(searchParams.get('limit') || '9', 10) || 9;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      (prisma as any).product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          category: true,
          inventoryItems: true,
        },
      }),
      (prisma as any).product.count({ where }),
    ]);

    return NextResponse.json({ products, total });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      imageUrl,
      categoryId,
      sizes,
      colors,
      inStock = true,
      featured = false,
      images,
    } = body ?? {};

    const errors: Record<string, string> = {};
    if (!name) errors.name = 'Name is required';
    if (!description) errors.description = 'Description is required';
    if (typeof price !== 'number' || Number.isNaN(price)) errors.price = 'Price must be a number';
    if (!imageUrl && (!Array.isArray(images) || images.length === 0)) {
      errors.imageUrl = 'At least one image is required';
    }
    if (!categoryId) errors.categoryId = 'Category is required';

    if (Object.keys(errors).length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const category = await (prisma as any).category.findUnique({ where: { id: String(categoryId) } });
    if (!category) {
      return NextResponse.json({ errors: { categoryId: 'Selected category does not exist' } }, { status: 400 });
    }

    const created = await prisma.product.create({
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

    // Create inventory items for all size/color combinations
    const inventoryItems = [];
    const productSizes = Array.isArray(sizes) ? sizes : [];
    const productColors = Array.isArray(colors) ? colors : [];

    for (const size of productSizes) {
      for (const color of productColors) {
        const inventoryItem = await (prisma as any).inventoryItem.create({
          data: {
            productId: created.id,
            size,
            color,
            quantity: 0, // Default to 0, admin can update later
          },
        });
        inventoryItems.push(inventoryItem);
      }
    }

    return NextResponse.json({ 
      product: {
        ...created,
        inventoryItems
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}


