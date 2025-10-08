
import * as admin from 'firebase-admin';

// =================================================================================
// GULDSTANDARD: firebase-admin.ts (KORRIGERAD VERSION)
// Denna version är nu anpassad för att matcha din befintliga .env.local-fil.
// =================================================================================

let firestoreAdmin: admin.firestore.Firestore;

// Kontrollera om Firebase Admin redan har initierats för att undvika dubbel-initiering.
if (!admin.apps.length) {
  // Läs in hela service account-objektet från den enskilda miljövariabeln.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON miljövariabel är inte definierad. Kontrollera din .env.local-fil.');
  }

  try {
    // Parsa JSON-strängen till ett JavaScript-objekt.
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initiera Firebase Admin SDK med det parsade service-kontot.
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    console.log("Firebase Admin SDK har initierats!");

  } catch (error) {
    console.error("Fel vid parsning av FIREBASE_SERVICE_ACCOUNT_JSON:", error);
    // Kasta om felet för att förhindra att applikationen startar med en felaktig konfiguration.
    throw new Error('Kunde inte initiera Firebase Admin SDK. Kontrollera formatet på FIREBASE_SERVICE_ACCOUNT_JSON.');
  }
}

// Exportera den initialiserade firestore-instansen.
firestoreAdmin = admin.firestore();

export { admin as firebaseAdmin, firestoreAdmin };
