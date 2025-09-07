
import { NextResponse } from 'next/server';
import { getGoogleTokens, getGoogleUserInfo } from '@/app/services/googleApiService';
import { admin } from '@/app/lib/firebase/firebaseAdmin';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/services/firestoreService';
import { getSession } from '@/app/lib/session'; // Importera vår nya session-hanterare

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=google_auth_denied', request.url));
  }

  try {
    // Steg 1: Byt ut koden mot tokens.
    const tokens = await getGoogleTokens(code);
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    if (!accessToken) {
        throw new Error("Access Token not received from Google.");
    }

    // Steg 2: Hämta användarinformation från Google.
    const userInfo = await getGoogleUserInfo(accessToken);
    const { id: googleId, email, displayName } = userInfo;

    // Steg 3: Hitta eller skapa en användare i Firebase Authentication.
    let userRecord;
    try {
        userRecord = await admin.auth().getUserByEmail(email);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            userRecord = await admin.auth().createUser({
                email: email,
                displayName: displayName,
                emailVerified: true,
            });
        } else {
            throw error;
        }
    }
    const uid = userRecord.uid;

    // Steg 4: Spara refresh token i Firestore.
    if (refreshToken) {
        const tokenRef = doc(db, 'user_tokens', uid);
        await setDoc(tokenRef, { 
            googleRefreshToken: refreshToken,
            googleId: googleId,
        }, { merge: true });
    }

    // Steg 5: Skapa en session för användaren.
    const session = await getSession();
    session.userId = uid; // Spara Firebase UID i sessionen
    session.isLoggedIn = true;
    await session.save(); // Detta krypterar och sätter session-cookien

    // Omdirigera till projektsidan med ett success-meddelande.
    return NextResponse.redirect(new URL('/projects?status=google_auth_success', request.url));

  } catch (error) {
    console.error("Critical error in Google auth callback: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.redirect(new URL(`/?error=google_auth_failed&details=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
