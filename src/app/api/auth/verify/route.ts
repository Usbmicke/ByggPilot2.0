
// ===================================================================
// API ENDPOINT: Verifiera Session (/api/auth/verify)
// ===================================================================
// Denna endpoint är designad för att anropas av middleware.
// Den tar en session-cookie, verifierar den, och returnerar användarstatus.

import { NextResponse, type NextRequest } from 'next/server';
import { auth, firestore } from '@/app/_lib/config/firebase-admin';

export const runtime = 'nodejs'; // Säkerställer att vi kan använda Firebase Admin SDK

export async function POST(request: NextRequest) {
  try {
    // 1. Hämta session-cookien från request body
    const { session } = await request.json();

    if (!session) {
      return new NextResponse(JSON.stringify({ isAuthenticated: false }), { status: 400 });
    }

    // 2. Verifiera cookien med Admin SDK
    const decodedToken = await auth.verifySessionCookie(session, true);

    // 3. Hämta användardata från Firestore för att få onboarding-status
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
        // Detta är ett edge-case där användaren finns i Auth men inte i databasen.
        return new NextResponse(JSON.stringify({ isAuthenticated: false, error: 'User not in Firestore' }), { status: 404 });
    }

    const { isOnboarded } = userDoc.data() as { isOnboarded?: boolean };

    // 4. Returnera ett framgångsrikt svar
    return new NextResponse(JSON.stringify({ 
      isAuthenticated: true, 
      isOnboarded: isOnboarded || false // Returnera false om fältet saknas
    }), { status: 200 });

  } catch (error) {
    // Om `verifySessionCookie` misslyckas (ogiltig/utgången) eller annat fel
    console.error('[API Verify Error]:', error);
    return new NextResponse(JSON.stringify({ isAuthenticated: false }), { status: 401 });
  }
}
