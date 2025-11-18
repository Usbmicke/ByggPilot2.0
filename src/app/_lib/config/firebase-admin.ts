
// ===================================================================
// SERVER-SIDA FIREBASE ADMIN-KONFIGURATION (ENDAST BACKEND)
// ===================================================================
// Denna fil initierar Firebase Admin SDK. Den är den enda källan
// till sanning för all backend-kommunikation med Firebase.
// Den är avsedd att användas i API Routes, Server Actions och middleware-anropade endpoints.
// FÅR ALDRIG IMPORTERAS I EN KLIENT-KOMPONENT.

import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// --- Initieringslogik ---

const SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!SERVICE_ACCOUNT_JSON) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON miljövariabel är inte satt. Kan inte initiera Admin SDK.');
}

// Parsa JSON-strängen från miljövariabeln
// Vi måste hantera eventuella escape-sekvenser korrekt.
const serviceAccount = JSON.parse(SERVICE_ACCOUNT_JSON);

// Initiera bara appen om den inte redan finns.
// Detta är viktigt för att undvika fel i Next.js med hot-reloading.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('[Firebase Admin]: SDK initierat.');
}

// --- Exporter ---

// Exportera de nödvändiga, färdig-initierade modulerna
export const auth = getAuth();
export const firestore = getFirestore();
export default admin;
