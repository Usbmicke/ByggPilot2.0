
// Fil: app/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// =========================================================================
// === NY STRUKTUR FÖR ATT FÖRHINDRA PROCESS-KONFLIKTER ====================
// =========================================================================
//
// Vi flyttar all initialiseringslogik till en funktion som anropas "lazy",
// dvs. bara när den faktiskt behövs. Detta förhindrar att Firebase Admin
// SDK körs automatiskt vid en import och krockar med andra bibliotek
// (som NextAuth) som också behöver prata med Google APIs.
//
// Denna funktion fungerar som en "singleton" - den ser till att appen
// bara initialiseras en enda gång under hela serverns livstid.
//
// =========================================================================

let firestoreAdminInstance: admin.firestore.Firestore | null = null;

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON är inte satt.');
    }
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    
    initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialiserad LAZY/ON-DEMAND för att undvika konflikter.");
  }
  return admin.firestore();
}

// Detta är den nya exporten. Den ser till att vi alltid får en giltig
// Firestore-instans utan att orsaka sidoeffekter vid import.
export function getFirestoreAdmin() {
  if (!firestoreAdminInstance) {
    firestoreAdminInstance = initializeFirebaseAdmin();
  }
  return firestoreAdminInstance;
}
