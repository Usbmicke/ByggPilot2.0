
import * as admin from 'firebase-admin';

// Denna konfiguration säkerställer att vi bara initierar appen en gång.
if (!admin.apps.length) {
  // Validera att alla nödvändiga miljövariabler finns.
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('Missing Firebase Admin credentials in .env.local. Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY');
  }

  // Viktigt: Byt ut alla förekomster av \\n med \n i den privata nyckeln.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    // Om du använder andra Firebase-tjänster som Realtime Database, lägg till dess URL här.
    // databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

// Exportera den initierade admin-appen och Firestore-instansen för användning i andra delar av backend.
const firestoreAdmin = admin.firestore();
export { admin as firebaseAdmin, firestoreAdmin };
