import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/config/firebase-admin';

interface VerifyResponse {
  isAuthenticated: boolean;
  isOnboarded?: boolean;
  uid?: string;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  const sessionCookie = request.cookies.get('session')?.value || '';

  if (!sessionCookie) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }

  try {
    // SLUTGILTIG KORRIGERING: Ändra checkRevoked till false.
    // Detta förhindrar ett race condition där en ny användares session underkänns
    // innan användaren är fullt propagerad i Firebase backend.
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, false);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const isOnboarded = userDoc.exists && userDoc.data()?.isOnboarded === true;

    return NextResponse.json({ isAuthenticated: true, uid: decodedToken.uid, isOnboarded }, { status: 200 });

  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return NextResponse.json({ isAuthenticated: false, error: 'Session invalid' }, { status: 401 });
  }
}
