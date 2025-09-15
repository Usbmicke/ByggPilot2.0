
import * as admin from 'firebase-admin';

// Denna konfiguration säkerställer att vi bara initierar appen en gång.
if (!admin.apps.length) {
  // Validera att alla nödvändiga miljövariabler finns.
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('Missing Firebase Admin credentials in .env.local. Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY');
  }

  // Återställd: Denna rad är KRITISK för att korrekt formatera den privata nyckeln från .env.local.
  // Den byter ut de text-escapade radbrytningarna (\\n) till faktiska radbrytningar (\n).
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey, // Använder den korrigerade nyckeln
    }),
  });
}

// Exportera den initierade admin-appen och Firestore-instansen för användning i andra delar av backend.
const firestoreAdmin = admin.firestore();
export { admin as firebaseAdmin, firestoreAdmin };
