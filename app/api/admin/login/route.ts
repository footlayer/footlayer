import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body ?? {};

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      return NextResponse.json(
        { error: 'Admin credentials not configured' },
        { status: 500 }
      );
    }

    if (username !== adminUser || password !== adminPass) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true });
    // Simple session flag; for production replace with a proper signed token/session store
    res.cookies.set('admin_session', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return res;
  } catch (error) {
    console.error('Error in admin login:', error);
    return NextResponse.json(
      { error: 'Failed to process login' },
      { status: 500 }
    );
  }
}


