
import { adminDb } from "@/lib/admin";
import { google } from 'googleapis';

// =================================================================================
// GULDSTANDARD - GOOGLE SERVER-KLIENT V2.0 (ROBUST & DIREKT)
// REVIDERING: Denna funktion är nu ombyggd för att hämta tokens direkt från
// användarens eget dokument i Firestore. Detta eliminerar beroendet av den
// opålitliga 'accounts'-samlingen och säkerställer en pålitlig och direkt
// anslutning till Google API:er.
// =================================================================================

export async function getGoogleAuthClient(userId: string) {
    if (!userId) {
        throw new Error("Användar-ID saknas för att skapa Google Auth-klient.");
    }

    // Hämta användardokumentet direkt från Firestore
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
        throw new Error(`Kunde inte hitta användardokument för ${userId}`);
    }

    const userData = userDoc.data();
    const refreshToken = userData?.refreshToken;

    // Verifiera att refreshToken finns, annars kan vi inte fortsätta
    if (!refreshToken) {
        throw new Error(`Inget refreshToken hittades för användare ${userId}. Användaren kan behöva återautentisera.`);
    }

    // Skapa en OAuth2-klient med de hämtade uppgifterna
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({ refresh_token: refreshToken });

    return auth;
}
