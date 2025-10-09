
import * as admin from 'firebase-admin';

// =================================================================================
// GULDSTANDARD: lib/admin.ts (KORRIGERAD VERSION 2.0)
// Exporterar nu adminDb och adminAuth för att matcha resten av applikationen.
// =================================================================================

// Kontrollera om Firebase Admin redan har initierats för att undvika dubbel-initiering.
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON miljövariabel är inte definierad. Kontrollera din .env.local-fil.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    console.log("Firebase Admin SDK har initierats!");

  } catch (error) {
    console.error("Fel vid parsning av FIREBASE_SERVICE_ACCOUNT_JSON:", error);
    throw new Error('Kunde inte initiera Firebase Admin SDK. Kontrollera formatet på FIREBASE_SERVICE_ACCOUNT_JSON.');
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { admin, adminDb, adminAuth };
