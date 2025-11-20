
// ===================================================================
// SERVER-SIDA FIREBASE ADMIN-KONFIGURATION (ENDAST BACKEND)
// (VERSION 2.0 - ROBUST INITIERING)
// ===================================================================
// Denna fil initierar Firebase Admin SDK. Den är den enda källan
// till sanning för all backend-kommunikation med Firebase.

import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// --- Robust Initieringslogik ---

// Initiera bara appen om den inte redan finns.
// Detta är kritiskt för att undvika fel i Next.js med hot-reloading.
if (!admin.apps.length) {
  console.log('[Firebase Admin]: Försöker initiera SDK...');
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON miljövariabel är inte satt.');
    }

    // Försök att parsa JSON. Fånga eventuella syntaxfel.
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
    console.log('[Firebase Admin]: SDK initierat framgångsrikt.');

  } catch (error) {
    console.error('[FATAL] Allvarligt fel vid initiering av Firebase Admin SDK:', error);
    // Kasta om felet för att säkerställa att servern inte startar i ett trasigt tillstånd.
    throw error;
  }
}

// --- Exporter ---

// Exportera de nödvändiga, färdig-initierade modulerna
export const auth = getAuth();
export const firestore = getFirestore();
export default admin;
