
import * as admin from 'firebase-admin';

// KORRIGERING: Implementerar en kontroll för att förhindra åter-initialisering i utvecklingsmiljön.
// Detta är en kritisk fix för att förhindra att "hot-reloading" skapar multipla, hängande databasanslutningar.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Säkerställer korrekt formatering av nyckeln
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export const firestoreAdmin = admin.firestore();
export const authAdmin = admin.auth();
