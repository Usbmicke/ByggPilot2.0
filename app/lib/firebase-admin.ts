// Fil: app/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

let firestoreAdmin: admin.firestore.Firestore;

function getFirestoreAdmin() {
  if (!firestoreAdmin) {
    try {
      // Försök initiera från miljövariabel (används i molnet)
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
      console.log('Firebase Admin SDK initialiserad från miljövariabel.');
    } catch (error) {
      console.error('Kunde inte initiera Firebase Admin från miljövariabel:', error);
      // Fallback för lokal utveckling (om den inte redan är initierad)
      if (!admin.apps.length) {
        // Notera: Detta kräver att du har GOOGLE_APPLICATION_CREDENTIALS satt i din lokala miljö,
        // eller att du kör på en Google-infrastruktur (som Cloud Workstation gör automatiskt).
        admin.initializeApp(); 
        console.log('Firebase Admin SDK initialiserad med standard-credentials.');
      }
    }
    firestoreAdmin = admin.firestore();
  }
  return firestoreAdmin;
}

export { getFirestoreAdmin };
