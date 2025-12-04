
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  // Säkerställ att vi inte initierar appen flera gånger.
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
