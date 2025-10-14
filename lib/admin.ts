
import * as admin from 'firebase-admin';

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

const firestoreAdmin = admin.firestore();
const adminAuth = admin.auth();

export { admin, firestoreAdmin, adminAuth };
