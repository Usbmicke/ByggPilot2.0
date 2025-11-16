import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin'; // Använder admin-instansen

interface VerifyResponse {
    isAuthenticated: boolean;
    isOnboarded?: boolean;
    error?: string;
}

/**
 * API-slutpunkt för att säkert verifiera en användares session från en httpOnly-cookie.
 * Denna slutpunkt är avsedd att anropas av middleware.
 */
export async function GET(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
    // Läs cookien från den inkommande förfrågan
    const sessionCookie = request.cookies.get('session')?.value || '';

    if (!sessionCookie) {
        return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    try {
        // Verifiera session-cookien med Firebase Admin SDK
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userId = decodedToken.uid;

        // Hämta användarprofilen från Firestore för att kontrollera onboarding-status
        const userDocRef = adminDb.collection('users').doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            // Detta är ett edge case, men bör hanteras.
            // Användaren finns i Auth men inte i databasen.
            return NextResponse.json({ isAuthenticated: true, isOnboarded: false }, { status: 200 });
        }

        const userData = userDoc.data();
        const isOnboarded = userData?.isOnboarded || false;

        return NextResponse.json({ isAuthenticated: true, isOnboarded }, { status: 200 });

    } catch (error) {
        console.error('[Auth Verify Error]', error);
        // Cookien är ogiltig eller har utgått
        return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }
}
