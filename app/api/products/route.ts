import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { Category } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // New filter parameters
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const featured = searchParams.get('featured');
    const onSale = searchParams.get('onSale');
    const sizes = searchParams.get('sizes');
    const colors = searchParams.get('colors');
    const sortBy = searchParams.get('sortBy') || 'featured';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: any = {};

    // Category filter
    if (categoryParam && categoryParam !== 'ALL') {
      where.category = { slug: String(categoryParam) };
    }
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Price range filter - handle multiple ranges with OR logic
    if (minPrice || maxPrice) {
      // If we have both min and max, it's a single range
      if (minPrice && maxPrice) {
        where.price = {
          gte: parseFloat(minPrice),
          lte: parseFloat(maxPrice)
        };
      } else if (minPrice) {
        where.price = {
          gte: parseFloat(minPrice)
        };
      } else if (maxPrice) {
        where.price = {
          lte: parseFloat(maxPrice)
        };
      }
    }

    // Stock filter
    if (inStock === 'true') {
      where.inStock = true;
    }

    // Featured filter
    if (featured === 'true') {
      where.featured = true;
    }

    // On sale filter
    if (onSale === 'true') {
      where.isDiscounted = true;
    }

    // Size filter
    if (sizes) {
      const sizeArray = sizes.split(',');
      where.sizes = {
        hasSome: sizeArray
      };
    }

    // Color filter
    if (colors) {
      const colorArray = colors.split(',');
      where.colors = {
        hasSome: colorArray
      };
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy = { price: sortOrder };
        break;
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'newest':
        orderBy = { createdAt: sortOrder };
        break;
      case 'featured':
      default:
        orderBy = [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true
        }
      }),
      prisma.product.count({ where })
    ]);

    // Debug: Check for products without categories or with invalid dates
    const productsWithoutCategory = products.filter(p => !p.category);
    if (productsWithoutCategory.length > 0) {
      console.warn(`Found ${productsWithoutCategory.length} products without categories:`, 
        productsWithoutCategory.map(p => ({ id: p.id, name: p.name, categoryId: p.categoryId }))
      );
    }

    // Debug: Check for invalid dates
    const productsWithInvalidDates = products.filter(p => 
      !p.createdAt || !p.updatedAt || 
      (p.category && (!p.category.createdAt || !(p.category as any).updatedAt))
    );
    if (productsWithInvalidDates.length > 0) {
      console.warn(`Found ${productsWithInvalidDates.length} products with invalid dates:`, 
        productsWithInvalidDates.map(p => ({ 
          id: p.id, 
          name: p.name, 
          createdAt: p.createdAt, 
          updatedAt: p.updatedAt,
          category: p.category ? {
            id: p.category.id,
            createdAt: p.category.createdAt,
            updatedAt: (p.category as any).updatedAt
          } : null
        }))
      );
    }

    const totalPages = Math.ceil(total / limit);

    // Serialize the products to ensure proper JSON formatting
    const serializedProducts = products.map(product => {
      const serializedProduct = {
        ...product,
        createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
        // Serialize discount date fields
        discountStartDate: (product as any).discountStartDate?.toISOString() || null,
        discountEndDate: (product as any).discountEndDate?.toISOString() || null,
        category: null as any
      };

      if (product.category) {
        serializedProduct.category = {
          ...product.category,
          createdAt: product.category.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: (product.category as any).updatedAt?.toISOString() || new Date().toISOString()
        };
      }

      return serializedProduct;
    });

    return NextResponse.json({
      products: serializedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}