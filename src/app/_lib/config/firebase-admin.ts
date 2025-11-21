
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  console.log('[Firebase Admin]: Försöker initiera SDK...');

  // Om vi kör i utvecklingsläge, använd INTE service-kontot.
  // Anslut till emulatorerna istället.
  if (process.env.NODE_ENV === 'development') {
    console.log("INFO: [Firebase Admin] Ansluter till Emulatorer (Auth & Firestore)")
    // Sätt miljövariablerna som Admin SDK automatiskt känner av.
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Använd projekt-ID från env
    });
    console.log('[Firebase Admin]: SDK initierat i Emulator-läge.');

  } else {
    // --- PRODUKTIONS-LÄGE ---
    // Detta körs när du driftsätter till Vercel, etc.
    try {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON miljövariabel är inte satt.');
      }

      let serviceAccount;
      try {
          serviceAccount = JSON.parse(serviceAccountJson);
      } catch (e) {
          console.error("[FATAL] Kunde inte parsa FIREBASE_SERVICE_ACCOUNT_JSON. Kontrollera att det är giltig JSON och korrekt escapat i .env.local");
          throw e;
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[Firebase Admin]: SDK initierat framgångsrikt i Produktions-läge.');

    } catch (error) {
      console.error('[FATAL] Allvarligt fel vid initiering av Firebase Admin SDK:', error);
      throw error;
    }
  }
}

export const auth = getAuth();
export const firestore = getFirestore();
export default admin;
