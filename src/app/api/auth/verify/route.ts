// src/app/api/auth/verify/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initializeAdminApp } from '@/lib/config/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { adminAuth, adminDb } = initializeAdminApp();
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false, isOnboarded: false }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();

    // This check is critical. We must ensure the user exists in our DB.
    if (!userDoc.exists) {
        return NextResponse.json({ isAuthenticated: false, isOnboarded: false }, { status: 401 });
    }

    const userData = userDoc.data();
    const isOnboarded = userData?.isOnboarded || false;

    // Return the JSON structure that the middleware expects.
    return NextResponse.json({ isAuthenticated: true, isOnboarded }, { status: 200 });

  } catch (error) {
    // Invalid cookie, expired, or other error.
    return NextResponse.json({ isAuthenticated: false, isOnboarded: false }, { status: 401 });
  }
}
