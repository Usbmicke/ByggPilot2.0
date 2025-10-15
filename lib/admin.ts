import admin from 'firebase-admin';
import { env } from '@/config/env';

let adminDb: admin.firestore.Firestore;
let adminAuth: admin.auth.Auth;

if (!admin.apps.length) {
  try {
    // KORRIGERING: Behandla serviceAccount som ett objekt direkt, inte en sträng.
    const serviceAccount = env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccount || typeof serviceAccount !== 'object' || !serviceAccount.private_key) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not a valid service account object or is missing a private key.");
    }

    // Skapa en kopia för att undvika att modifiera det cachade objektet.
    const serviceAccountCopy = { ...serviceAccount };

    // Ersätt newline-tecken i privatnyckeln.
    serviceAccountCopy.private_key = serviceAccount.private_key.replace(/\n/g, '\n');

    // Logga det förberedda objektet för verifiering (utan privat nyckel).
    const { private_key, ...serviceAccountForLogging } = serviceAccountCopy;
    console.log("Attempting to initialize Firebase Admin with prepared service account:", JSON.stringify(serviceAccountForLogging, null, 2));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountCopy),
      databaseURL: `https://${serviceAccountCopy.project_id}.firebaseio.com`,
      projectId: serviceAccountCopy.project_id,
    });

    console.log("Firebase Admin SDK initialized successfully.");

  } catch (error: any) {
    console.error("FATAL ERROR: Could not initialize Firebase Admin SDK.", error);
    throw new Error(`Could not initialize Firebase Admin SDK: ${error.message}`);
  }
}

adminDb = admin.firestore();
adminAuth = admin.auth();

export { adminDb, adminAuth };
