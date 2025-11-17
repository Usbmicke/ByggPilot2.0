// src/app/api/auth/verify/route.ts
import { NextResponse, type NextRequest } from 'next/server';
// Importera din NYA SYNKRONA admin-initiering
import { initializeAdminApp } from '@/lib/config/firebase-admin'; 

// Tvinga denna rutt att ALLTID köras i Node.js
export const runtime = 'nodejs'; 

interface VerifyResponse {
  isAuthenticated: boolean;
  isOnboarded?: boolean;
  uid?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  try {
    // Initiera Admin SDK (den cachade instansen kommer att användas)
    // Detta anrop är nu SYNKRONT och kraschar inte.
    const { auth, db } = initializeAdminApp(); 

    const sessionCookie = request.cookies.get('session')?.value || '';

    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      console.warn(`Verifiering lyckades (UID: ${decodedToken.uid}) men ingen Firestore-profil hittades.`);
      return NextResponse.json({ isAuthenticated: true, uid: decodedToken.uid, isOnboarded: false }, { status: 200 });
    }

    const isOnboarded = userDoc.data()?.isOnboarded === true;
    return NextResponse.json({ isAuthenticated: true, uid: decodedToken.uid, isOnboarded }, { status: 200 });

  } catch (error: any) {
    console.error('[/api/auth/verify Error]:', error.message);
    return NextResponse.json({ isAuthenticated: false, error: 'Invalid session' }, { status: 401 });
  }
}
