
// Fil: app/lib/firebase-admin.ts
// Denna fil är ENDAST för server-sidan.

import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Läs in service account-nycklarna från miljövariablerna.
// Detta är den säkra metoden för server-sidan.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  // Ersätt \n med faktiska radbrytningar för private key, vilket är nödvändigt när den läses från .env
  privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
};

// Undvik att åter-initialisera appen vid varje hot-reload i utvecklingsmiljö.
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Exportera den korrekta ADMIN-versionen av firestore.
// Denna instans har fulla rättigheter att läsa/skriva till databasen.
const firestoreAdmin = admin.firestore();

export { firestoreAdmin };
