
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/services/firestoreService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { createInitialProjectStructure } from '@/app/services/driveService';

/**
 * GULDSTANDARD Action för att skapa den initiala mappstrukturen i Google Drive.
 * Denna funktion är säker by design och hämtar användarens identitet
 * och refresh token direkt från server-sidan, vilket eliminerar behovet
 * av osäkra, klient-skickade tokens.
 */
export async function createProjectFolderStructure() {
  try {
    // Steg 1: Hämta sessionen säkert på servern.
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.uid) {
      throw new Error('Autentisering krävs. Användaren kan inte verifieras.');
    }
    const userId = session.user.uid;

    // Steg 2: Hämta användarens refresh_token säkert från Firestore.
    // Notera: Använder den Guldstandard-kompatibla klient-SDK:n 'db'.
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'Användaren hittades inte i databasen.' };
    }
    const userData = userDoc.data();
    if (!userData || !userData.refresh_token) {
        // Om refresh token saknas, måste användaren återautentisera sig.
        // Detta är ett designval för ökad säkerhet.
        return { success: false, error: 'Refresh token saknas. Vänligen logga in igen för att återansluta ditt Google-konto.' };
    }
    const refreshToken = userData.refresh_token;

    // Steg 3: Anropa Drive-servicen för att skapa mappstrukturen.
    const folderId = await createInitialProjectStructure(refreshToken);

    // Steg 4: Uppdatera användarens dokument med det nya mapp-ID:t.
    await updateDoc(userDocRef, { 
      hasCompletedOnboarding: true,
      driveRootFolderId: folderId
    });

    console.log(`[DRIVE_ACTION] Mappstruktur skapad för användare ${userId} med rotmapp-ID: ${folderId}`);

    // Steg 5: Returnera ett framgångsrikt svar.
    return { success: true, folderId: folderId };

  } catch (error: any) {
    console.error("[DRIVE_ACTION_ERROR]", error);
    // Returnera ett mer informativt felmeddelande till anropande 'tool'.
    return { success: false, error: `Kunde inte skapa mappstruktur: ${error.message}` };
  }
}
