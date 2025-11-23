
import { type NextRequest, NextResponse } from 'next/server';
import { verifySession, getUserProfileForMiddleware } from '@/app/_lib/dal/dal';

export async function GET(request: NextRequest) {
  // We get the session cookie from the request that the proxy forwarded.
  const sessionCookie = request.cookies.get('__session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }

  try {
    // We use the existing, powerful functions from dal.ts in a safe environment (Node.js).
    const session = await verifySession(sessionCookie);
    const userProfile = await getUserProfileForMiddleware(session.userId);

    if (!userProfile) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    // Return a simple, clean JSON response.
    return NextResponse.json({
      isAuthenticated: true,
      isOnboardingComplete: userProfile.onboardingStatus === 'complete',
    });
  } catch (error) {
    console.error('[API/VERIFY] Session verification failed:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }
}
