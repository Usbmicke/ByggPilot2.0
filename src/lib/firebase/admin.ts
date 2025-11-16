import admin from 'firebase-admin';

// Kolla om appen redan har initierats för att undvika fel vid Next.js hot-reloads
if (!admin.apps.length) {
  try {
    // När denna kod körs på servern (t.ex. Vercel, Firebase Functions), kommer den
    // automatiskt att använda de tjänstekontouppgifter som finns i miljövariablerna
    // (som t.ex. GOOGLE_APPLICATION_CREDENTIALS).
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error('Kunde inte initiera Firebase Admin SDK. Kontrollera serverns miljövariabler.');
  }
}

// Exportera de admin-moduler som behövs i applikationens backend
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
