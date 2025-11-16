import { NextResponse, type NextRequest } from 'next/server';
// Uppdaterad sökväg för att matcha den nya filstrukturen
import { adminAuth, adminDb } from '@/lib/config/firebase-admin'; 

interface VerifyResponse {
    isAuthenticated: boolean;
    isOnboarded?: boolean;
    error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
    const sessionCookie = request.cookies.get('session')?.value || '';

    if (!sessionCookie) {
        return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, false);
        const userId = decodedToken.uid;

        const userDocRef = adminDb.collection('users').doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ isAuthenticated: true, isOnboarded: false }, { status: 200 });
        }

        const userData = userDoc.data();
        const isOnboarded = userData?.isOnboarded || false;

        return NextResponse.json({ isAuthenticated: true, isOnboarded }, { status: 200 });

    } catch (error) {
        console.error('[Auth Verify Error]', error);
        return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }
}
