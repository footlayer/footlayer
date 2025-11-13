import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// GET - Public categories endpoint, returns top 4 by newest
export async function GET(_request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: { id: true, name: true, slug: true }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}


