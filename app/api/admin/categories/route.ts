import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = await (prisma as any).category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const isAdmin = cookies().get('admin_session')?.value === 'true';
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { name, slug } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }
    const created = await (prisma as any).category.create({ data: { name, slug } });
    return NextResponse.json({ category: created });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}


