
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage'; 

if (!admin.apps.length) {
  console.log('[Firebase Admin]: Försöker initiera SDK...');

  try {
    let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON miljövariabel är inte satt.');
    }

    if (serviceAccountJson.startsWith("'") && serviceAccountJson.endsWith("'")) {
      console.log('[Firebase Admin]: Upptäckte och korrigerar apostrofer runt JSON-strängen.');
      serviceAccountJson = serviceAccountJson.substring(1, serviceAccountJson.length - 1);
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (e) {
      console.error("[FATAL] Kunde inte parsa FIREBASE_SERVICE_ACCOUNT_JSON. Kontrollera att det är giltig JSON.", e);
      throw e;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'byggpilot-v2.firebasestorage.app' // TILLAGD
    });

    console.log('[Firebase Admin]: SDK initierat framgångsrikt.');

  } catch (error) {
    console.error('[FATAL] Allvarligt fel vid initiering av Firebase Admin SDK:', error);
    throw error;
  }
}

export const auth = getAuth();
export const firestore = getFirestore();
export const storage = getStorage(); // TILLAGD
export default admin;
