import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth } from '@/lib/config/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token as string;

    if (!token) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 dagar
    const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax' as const,
    };

    const response = NextResponse.json({ success: true });
    response.cookies.set(options);
    return response;

  } catch (error: any) {
    console.error('Session Login Error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const options = { name: 'session', value: '', maxAge: -1 };
    const response = NextResponse.json({ success: true });
    response.cookies.set(options);
    return response;

  } catch (error: any) {
    console.error('Session Logout Error:', error);
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}
