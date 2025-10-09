
import { NextResponse } from 'next/server';
import { createInitialProjectStructure } from '@/services/driveService';
import { authAdmin as adminAuth, firestoreAdmin as db } from '@/lib/admin';

/**
 * Skyddad API-slutpunkt för att skapa den initiala mappstrukturen 
 * för en ny användare under onboarding.
 */
export async function POST(request: Request) {
  try {
    // 1. Verifiera användarens identitet med Firebase Auth
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token is missing or invalid' }, { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Hämta användarens refresh_token från Firestore
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found in Firestore' }, { status: 404 });
    }
    const userData = userDoc.data();
    if (!userData || !userData.refresh_token) {
      return NextResponse.json({ error: 'Refresh token not found for user' }, { status: 400 });
    }
    const refreshToken = userData.refresh_token;

    // 3. Anropa Drive-servicen för att skapa mappstrukturen
    // Denna funktion använder nu användarens eget refresh_token
    const folderId = await createInitialProjectStructure(refreshToken);

    // 4. Uppdatera användarens status i Firestore för att markera onboarding som slutförd
    await userDocRef.update({ 
      hasCompletedOnboarding: true,
      driveRootFolderId: folderId // Spara ID:t för framtida bruk
    });

    // 5. Returnera ett framgångsrikt svar
    return NextResponse.json({ 
      message: 'Initial project structure created successfully in your Google Drive!', 
      folderId: folderId 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error during initial project structure creation:", error);

    // Hantera specifikt Firebase Auth-fel
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ error: 'Invalid or expired authorization token' }, { status: 403 });
    }

    // Skicka ett generiskt felmeddelande för andra typer av fel
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
