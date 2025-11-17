import { NextResponse } from 'next/server';

// Denna route har ett enda syfte: att förstöra session-cookien och logga ut användaren.
export async function POST() {
  try {
    const options = {
      name: 'session',
      value: '',
      maxAge: -1, // Sätt till ett negativt värde för att instruera webbläsaren att radera cookien
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax' as const,
    };

    const response = NextResponse.json({ success: true, message: 'Logged out' });
    response.cookies.set(options);
    return response;

  } catch (error: any) {
    console.error('Session Logout Error:', error);
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}
