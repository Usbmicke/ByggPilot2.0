import admin from 'firebase-admin';
import { getApps, initializeApp } from 'firebase-admin/app';

let firestoreAdminInstance: admin.firestore.Firestore | null = null;

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      throw new Error('Miljövariabeln GOOGLE_SERVICE_ACCOUNT_JSON är inte satt.');
    }
    
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    
    initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialiserad.");
  }
  return admin.firestore();
}

export function getFirestoreAdmin() {
  if (!firestoreAdminInstance) {
    firestoreAdminInstance = initializeFirebaseAdmin();
  }
  return firestoreAdminInstance;
}
