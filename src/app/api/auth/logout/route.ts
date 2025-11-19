
import { NextResponse } from 'next/server';

// =======================================================================
//  API ENDPOINT: Logga ut (/api/auth/logout)
//  (VERSION 2.0 - KORRIGERAD COOKIE-NAMN)
// =======================================================================

export async function POST() {
  try {
    // KORRIGERING: Använder det korrekta cookie-namnet '__session'
    // Detta säkerställer att vi raderar rätt cookie och loggar ut användaren.
    const options = {
      name: '__session', // Matchar nu middleware och session-skapande
      value: '',
      maxAge: -1, 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax' as const,
    };

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.set(options);
    return response;

  } catch (error: any) {
    console.error('Session Logout Error:', error);
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}
