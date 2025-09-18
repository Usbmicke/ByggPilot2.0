
import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/app/lib/firebase/server'; // Admin SDK
import { auth as adminAuth } from 'firebase-admin';

/**
 * This endpoint is responsible for securely storing a user's OAuth tokens.
 * It must be called immediately after a successful client-side login.
 * It verifies the user's identity via their Firebase ID token and then stores
 * the provided Google OAuth tokens in a secure, server-only-accessible collection.
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Verify the user's identity.
        const authorization = req.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
        }
        const idToken = authorization.split('Bearer ')[1];
        const decodedToken = await adminAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // 2. Get the tokens from the request body.
        const { accessToken, refreshToken } = await req.json();
        if (!accessToken) {
            return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
        }

        // 3. Store the tokens in a secure, private subcollection.
        // Security rules MUST prevent client access to this collection.
        const privateDataRef = firestore.collection('users').doc(uid).collection('private').doc('google');
        
        await privateDataRef.set({
            accessToken,
            refreshToken, // May be undefined, which is fine
            updatedAt: new Date(),
        }, { merge: true });

        return NextResponse.json({ success: true, message: 'Tokens stored securely.' });

    } catch (error: any) {
        console.error('Error storing tokens:', error);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ error: 'Firebase ID token has expired. Please re-authenticate.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
    }
}
